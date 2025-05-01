export const isAdmin = ( request,  response, next) => {
    if (request.user.isAdmin) {
      console.log("checking the loggedin SER IS ADMIN")
      console.log(request.user.isAdmin)
      return next() 
    }
    return  response.status(403).send('Unauthorised Access') 
  } 