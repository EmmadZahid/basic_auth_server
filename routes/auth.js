const express = require('express')
const router = express.Router()
const {body} = require('express-validator')

const AuthController = require('../controllers/auth')

router.post('/register',[
    body('email').trim().not().isEmpty().withMessage('Email required!').isEmail().withMessage('Please enter valid email'),
    body('password').trim().not().isEmpty().withMessage('Password required!').isLength({min: 6}).withMessage('Minimum length of password is 6 characters'),
    body('password').custom(value =>{
        var complexPasswordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        if(complexPasswordRegex.test(value)){
            return Promise.resolve()
        }
        return Promise.reject('Please enter complex password!')
    })
], AuthController.register)

router.post('/login', AuthController.login)

router.get('/secret', AuthController.secret)

module.exports = router