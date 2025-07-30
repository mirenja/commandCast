//import * as jwt from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config/app.js'
import { User} from '../models/user.js'
import { comparePassword } from './passwordHashing.js'


export function generateAccessToken(user_id) {
  try {
    console.log("➡️  user_id input to token:", user_id)

    const token = jwt.sign(user_id, TOKEN_SECRET, { expiresIn: '1800s' })
    
    console.log("✅ token generated:", token)
    return token
  } catch (err) {
    console.error("❌ Error generating token:", err)
    throw err 
  }
}

export async  function  validateUser(email,password){
    console.log("validating the user...")
    const user = await User.findOne({email:email}).exec()
     console.log('Found user?', !!user)
    //console.log('validate use rfunction returns:',user)

    if (!user){
        throw new Error('User not found')
        // return response.redirect('/?message='+message)
    }

    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
        throw new Error('Password does not match');
    }

    return user

}