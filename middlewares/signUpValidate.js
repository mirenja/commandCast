import { body,validationResult } from 'express-validator'

export const signupValidationRules = [
  body('name')
    .isString().withMessage('Name must be a string')
    .isLength({ max: 50 }).withMessage('Name must be at most 50 characters')
    .escape().trim(),

  body('email')
    .isString().withMessage('Email must be a string')
    .isLength({ max: 50 }).withMessage('Email must be at most 50 characters')
    .isEmail().withMessage('Invalid email format')
    .escape().trim(),

  body('password')
    .isString()
    .isLength({ min: 10, max: 20 }).withMessage('Password must be 10–20 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must include letters, numbers, and a special character')
    .escape().trim(),

  body('confirm_password')
    .isString()
    .isLength({ min: 10, max: 20 })
    .custom((value, { request }) => {
      if (value !== request.body.password) throw new Error('Passwords do not match')   
      return true   
    })
]   

export const validate = (request, res, next) => {
    const errors = validationResult(request)    
    if (!errors.isEmpty()) {
      const messages = errors.array().map(err => err.msg)    
      const firstMessage = messages[0] === 'Invalid value' ? 'Invalid email' : messages[0]    
      return res.redirect('/signup?message=' + encodeURIComponent(firstMessage))    
    }
    next()    
  }    
  