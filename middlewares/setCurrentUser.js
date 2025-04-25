import {getUserFromToken} from '../services/getUserFromToken.js'


export async function setCurrentUser(request, response, next) {
    const token = request.cookies.token
    console.log('Token from cookies:', token)
  
    const user = await getUserFromToken(token)
    console.log("cutrrent user is :",user)
  
      request.user = user
    //   console.log("the user in middleware",user)
      response.locals.loggedInUser = user || null
      next()
  }