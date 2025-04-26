import { faker } from '@faker-js/faker'

const commandMap = {
    'General Monitoring': ['uptime', 'whoami', 'hostname', 'date'],
    'System Info': ['df -h', 'free -m', 'top -b -n 1', 'uname -a'],
    'Networking': ['ip a', 'ping -c 4 8.8.8.8']
  }


export const buildCommand =(userId,session_id,client_id) => {
    const command_category = faker.helpers.arrayElement(Object.keys(commandMap))
    const command_text = faker.helpers.arrayElement(commandMap[command_category])

    return({
    id: faker.string.uuid(),
    session_id: session_id,
    sent_by:userId,
    client_id: client_id,
    command_text,
    command_category,
    })
}