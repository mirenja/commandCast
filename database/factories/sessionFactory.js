import { faker } from '@faker-js/faker'
import {Session} from '../../models/session.js'

export const  buildSession = (userId) => {
    return ({
        id: faker.string.uuid(),
        session_id:`session-${faker.string.numeric(10)}`,
        started_by: userId,
        clients: null
    })
}


