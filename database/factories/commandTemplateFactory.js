import { faker } from '@faker-js/faker'

const commandMap = {
    'General Monitoring': ['uptime', 'whoami', 'hostname', 'date'],
    'System Info': ['df', 'free', 'top', 'uname'],
    'Networking': ['ip a', 'ping']
  }

export const buidCommandTemplate =(userId) => {
    const category = faker.helpers.arrayElement(Object.keys(commandMap))
    const name = faker.helpers.arrayElement(commandMap[category])

    return({
    id: faker.string.uuid(),
    name,
    category,
    created_by :userId
    })
}