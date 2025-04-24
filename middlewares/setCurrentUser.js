import {getUserFromToken} from '../services/getUserFromToken.js'


export async function setCurrentUser(request, response, next) {
  const token = request.cookies.token
  console.log('Token from cookies:', token)

  const user = await getUserFromToken(token)
  console.log("cutrrent user is :",user)

    request.user = user
    next()
}