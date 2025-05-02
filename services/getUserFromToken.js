import jwt from 'jsonwebtoken'

import {User} from '../models/user.js'

export async function getUserFromToken(token) {
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
    // console.log("decoded is", decoded)

    const user = await User.findById(decoded.userId)

    return user || null
  } catch (error) {
    console.error("Error decoding token:", error);
    return null
  }
}


