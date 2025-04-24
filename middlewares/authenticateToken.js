import jwt from 'jsonwebtoken'

function authenticateToken(request, response, next) {
  const authHeader = request.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return response.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
    console.log(err)

    if (err) return response.sendStatus(403)

    request.user = user

    next()
  })
}