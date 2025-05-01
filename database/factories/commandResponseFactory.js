import { faker } from '@faker-js/faker'


export const buildCommandResponse =(commandId,clientId) => {
    return({
    command_id:commandId,
    client_id:clientId,
    response_text:faker.lorem.words(10)
    })
}