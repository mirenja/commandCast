import express from 'express'
import mongoose from 'mongoose'

import { PORT } from '../../config/app.js'
import '../../config/database.js'

import {User} from '../../models/user.js'
import {Session} from '../../models/session.js'
import {CommandResponse} from '../../models/commandResponse.js'
import {Command} from '../../models/command.js'
import {Client} from '../../models/client.js'
import {AuditLog} from '../../models/auditLog.js'

import { faker } from '@faker-js/faker'
import { buildUser } from '../factories/userFactory.js'
import { buildSession } from '../factories/sessionFactory.js'
import { buidClient } from '../factories/clientFactory.js'
import { buildCommand} from '../factories/commandFactory.js'
import { buildCommandResponse} from '../factories/commandResponseFactory.js'
import { buildAuditLog } from '../factories/auditLogFactory.js'

async function seed(){
    try{
        console.log('....seeding database......')

        await mongoose.connection.dropDatabase()

        const fakeUsers = Array.from({length: 7}, () => buildUser())
        const users = await User.insertMany(fakeUsers)
        console.log('Users seeded successfully!')

        const clients = await Client.insertMany(
            Array.from({length: 20}, () =>  buidClient()),)
            
        console.log('Clients seeded successfully!')

        const sessions  =[]

        for (const user of users){
            
            const sessionNumber = faker.number.int({min:0, max:5})
            
            for (let i = 0; i < sessionNumber; i++){

                const selectedClients = faker.helpers.arrayElements(clients, {min:2 , max:5})
                const clientIds = selectedClients.map(client => client._id)

                const sessionData = buildSession(user._id,clientIds)
                console.log('Creating session for user:', user.name)
                console.log('Creating session for sessionData:', sessionData)

                const session = await Session.create(sessionData)
                sessions.push(session)
                console.log("session data added!!!!!!")

                for (const client of selectedClients){
                    client.sessions.push(session._id)
                    await client.save()
                    console.log("client save!!!")
                }

                console.log("end of client creation loop")

                const commands = Array.from({length:10}, () => {
                    const randomClient = faker.helpers.arrayElement(selectedClients)
                    // console.log("radom client selected:",randomClient)
                    return buildCommand(user._id,session._id,randomClient._id)
                    console.log("command succesfully built.")
                })
                console.log("commands generated,", commands)

                const insertedCommands = await Command.insertMany(commands)
                console.log("commands inserted generating responses.......")

                const responses = insertedCommands.map(command => {
                    console.log('command being parsed is.......... : ', command)
                    const randomClient = faker.helpers.arrayElement(selectedClients)
                    return buildCommandResponse(command.id,randomClient._id)
                })
                await CommandResponse.insertMany(responses)
                
                const auditLogs = []
                for (const command of insertedCommands){
                    const log1 = buildAuditLog(
                        session._id,
                        'User',
                        user._id,
                        'command_sent',
                        {
                            command_id: command.id,
                            command: command.command_text,
                            sent_at: command.createdAt
                        }
                    )
                    auditLogs.push(log1)
                }
                await AuditLog.insertMany(auditLogs)
            }
        }

    }catch (error){
        console.error('Error seeding: ', error)
    }
}

seed()
    .then(() => {
        console.log('Seeding completed!!!!!!!')
        mongoose.disconnect()
    })
    .catch( error => {
        console.error('Seeding had an error',error)
        mongoose.disconnect()
    })