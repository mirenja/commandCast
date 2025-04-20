import express from 'express'
import mongoose from 'mongoose'

import { PORT } from '../../config/app.js'
import '../../config/database.js'

import {User} from '../../models/user.js'
import {Session} from '../../models/session.js'
import {CommandTemplate} from '../../models/commandtemplate.js'
import {CommandResponse} from '../../models/commandResponse.js'
import {Command} from '../../models/command.js'
import {Client} from '../../models/client.js'
import {AuditLog} from '../../models/auditLog.js'

import { faker } from '@faker-js/faker'
import { buildUser } from '../factories/userFactory.js'
import { buildSession } from '../factories/sessionFactory.js'
import { buidClient } from '../factories/clientFactory.js'
import { buildCommand} from '../factories/commandFactory.js'

async function seed(){
    try{
        console.log('....seeding databse......')

        await mongoose.connection.dropDatabase()

        const users = Array.from({length: 2}, () => buildUser())
        await User.insertMany(users)
        console.log('Users seeded successfully!')

        const clients = await Client.insertMany(
            Array.from({length: 5}, () =>  buidClient()),)
            
        console.log('Clients seeded successfully!')

        const sessions  =[]

        for (const user of users){
            const selectedClients = faker.helpers.arrayElements(clients, {min:2 , max:5})
            const clientIds = selectedClients.map(client => client.id)

            const sessionData = buildSession(user.id,clientIds)
            console.log('Creating session for user:', user.name)
            console.log('Creating session for sessionData:', sessionData)

            const session = await Session.create(sessionData)
            sessions.push(session)

            for (const client of selectedClients){
                client.sessions.push(session.id)
                await client.save()
            }

            const commands = Array.from({length:5}, () => 
                buildCommand(user.id,session.id)
            )
            await Command.insertMany(commands)
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