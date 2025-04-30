import { faker } from '@faker-js/faker'
import {Session} from '../../models/session.js'

export const  buildSession = (userId,ClientId) => {
    return ({
        session_id:`session-${faker.string.numeric(10)}`,
        started_by: userId,
        clients: ClientId
    })
}


