import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from './config/app.js'

export function  generateAccessToken({user_id}){
    return jwt.sign(user_id,TOKEN_SECRET,{expiresIn: '1800s'})
}

