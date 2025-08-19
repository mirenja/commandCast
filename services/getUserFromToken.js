import jwt from 'jsonwebtoken'

import {User} from '../models/user.js'

export async function getUserFromToken(req, res, next) {
  if (req.oidc && req.oidc.user) {
    const user = await User.findOne({ email: req.oidc.user.email })
    if (!user) {
      return res.status(401).send("Logged-in user not found in DB")
    }

    req.user = user
    res.locals.loggedInUser = user
  } else {
    res.locals.loggedInUser = null
  }

  next()
}

