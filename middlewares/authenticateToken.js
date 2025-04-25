import jwt from 'jsonwebtoken'



export function authenticateToken(request, response, next) {

    const token = request.cookies.token

  if (token == null) return response.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
    if (error){
        console.log(err)
        return response.sendStatus(403)
    }
    request.user = user
    next()
    })
}
