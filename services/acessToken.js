import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config/app.js'
import { User} from '../models/user.js'


export function  generateAccessToken({user_id}){
    return jwt.sign(user_id,TOKEN_SECRET,{expiresIn: '1800s'})
}

export async  function  validateUser(email,password){
    const user = await User.findOne({email:email}).exec()

    if (!user){
        throw new Error('User not found')
        // return response.redirect('/?message='+message)
    }

    if (user.password !== password) {
        throw new Error('password does not match')
        // return response.redirect('/?message='+message)
    }
    return user

}