import jwt from 'jsonwebtoken'



export function authenticateToken(request, response, next) {

    const token = request.cookies.token

  if (token == null) return response.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
    if (error){
        console.log(error)
        connections.clear()
        response.clearCookie('token')
        response.clearCookie('sessionCookie')
        return response.redirect('/?error=forbidden')
        
    }
    request.user = user
    next()
    })
}
