const express = require('express')
const router = express.Router()
const {body} = require('express-validator')

const UserController = require('../controllers/users')

router.post('/signup',[
    body('email').trim().not().isEmpty().withMessage('Email required!').isEmail().withMessage('Please enter valid email'),
    body('password').trim().not().isEmpty().withMessage('Password required!').isLength({min: 6}).withMessage('Minimum length of password is 6 characters')
], UserController.signUp)

router.post('/signin', UserController.signIn)

router.get('/secret', UserController.secret)

module.exports = router