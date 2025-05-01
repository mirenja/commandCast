import { faker } from '@faker-js/faker'
import {User} from '../../models/user.js'


export const buildUser = () => {
    return ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        isAdmin: faker.datatype.boolean()
    })
}