import { faker } from '@faker-js/faker'


export const buidClient =(sessionId) => {
    return({
    id: faker.string.uuid(),
    name: `host-${faker.number.int(30)}`,
    mac_address: faker.internet.mac(),
    ip_address: faker.internet.ip(),
    status: faker.helpers.arrayElement(['online', 'offline', 'unknown']),
    sessions:[sessionId]
    })
}