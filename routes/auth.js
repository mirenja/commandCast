import express from 'express'
import { body, validationResult } from 'express-validator'
import { User } from '../models/user.js'
import { Session } from '../models/session.js'
import { generateAccessToken, validateUser } from '../services/acessToken.js'
import { hashPassword, generatedSalt } from '../services/passwordHashing.js'
import { getBerlinTime } from '../services/berlinTime.js'
import { signupValidationRules, validate } from '../middlewares/signUpValidate.js'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

router.get('/', (req, res) => res.render('index'))

router.post('/login',
  body('email').isEmail().withMessage("invalid Email").trim().escape(),
  body('password').isString().isLength({ max: 20 }).withMessage("invalid password").trim().escape(),
  async (req, res) => {
    try {
      validationResult(req).throw()
      const { email, password } = req.body
      const validatedUser = await validateUser(email, password)
      const token = await generateAccessToken({ userId: validatedUser._id })

      const session = new Session({
        session_id: crypto.randomBytes(8).toString('hex'),
        started_by: validatedUser._id
      })
      await session.save()

      const createdAt = session.createdAt
      const date = getBerlinTime(createdAt)
      const time = getBerlinTime(createdAt)

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 3600000
      })

      const sessionCookie = {
        id: session.id,
        session_id: session.session_id,
        date: date.date,
        time: time.time
      }

      res.cookie('sessionCookie', sessionCookie, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 3600000,
      })

      res.redirect('/dashboard')

    } catch (error) {
      if (Array.isArray(error.errors)) {
        const messages = error.errors.map(err => err.msg)
        return res.redirect('/?message=' + encodeURIComponent(messages[0]))
      }
      res.redirect('/?message=' + encodeURIComponent('An unexpected error occurred'))
    }
  }
)

router.get('/signup', (req, res) => res.render('signup'))

router.post('/signup', signupValidationRules, validate, async (req, res) => {
  try {
    const salt = await generatedSalt()
    const hashedPassword = await hashPassword(req.body.password, salt)
    const newUser = new User({
      id: uuidv4(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    await newUser.save()
    res.redirect('/?message=User+added+successfully')
  } catch (error) {
    const messages = Array.isArray(error.errors) ? error.errors.map(e => e.msg) : ['Unexpected error']
    let firstMessage = messages[0] === 'Invalid value' ? 'invalid Email' : messages[0]
    res.redirect('/signup?message=' + encodeURIComponent(firstMessage))
  }
})

router.post('/logout', async (req, res) => {
  const { connections, onlineClients } = req.app
  for (const [_id, conn] of connections.entries()) {
    try {
      conn.end()
      await Client.updateOne({ _id }, { status: 'offline' })
    } catch (err) {
      console.log("Error disconnecting", err)
    }
  }
  connections.clear()
  onlineClients.clear()
  res.clearCookie('token')
  res.clearCookie('sessionCookie')
  res.redirect('/')
})

export default router
