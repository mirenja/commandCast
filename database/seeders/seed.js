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
import { buildUser } from '../factories/UserFactory.js'
import { buildSession } from '../factories/sessionFactory.js'



async function seed(){
    try{
        console.log('....seeding databse......')

        await mongoose.connection.dropDatabase()

        const users = Array.from({length: 2}, () => buildUser())
        await User.insertMany(users)
        console.log('Users seeded successfully!')

        const sessions = await Promise.all(
            users.map((user) => {
                const sessionData = buildSession(user.id)
                console.log('Creating session for user:', user.name)
                console.log('Creating session for sessionData:', sessionData)
                return Session.create(sessionData)
            })
        )
        console.log('Sessions seeded successfully!')

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