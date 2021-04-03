const express = require('express')
const router = express.Router()
const {body} = require('express-validator')
const HandleValidation = require('../middlewares/handleValidation')
const VerifySignup = require('../middlewares/verifySignup')

const AuthController = require('../controllers/auth.controller')

router.post('/register',[
    body('email').trim().not().isEmpty().withMessage('Email required!').isEmail().withMessage('Please enter valid email'),
    body('username').trim().not().isEmpty().withMessage('Username required!'),
    body('password').trim().not().isEmpty().withMessage('Password required!').isLength({min: 6}).withMessage('Minimum length of password is 6 characters'),
    body('password').custom(value =>{
        var complexPasswordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        if(complexPasswordRegex.test(value)){
            return Promise.resolve()
        }
        return Promise.reject('Please enter complex password!')
    })
], 
HandleValidation.handleValidationErrors,
VerifySignup.checkIfEmailAlreadyExists,
VerifySignup.checkRolesExisted,
AuthController.register)

router.post('/registerViaEmail',[
    body('email').trim().not().isEmpty().withMessage('Email required!').isEmail().withMessage('Please enter valid email'),
    body('username').trim().not().isEmpty().withMessage('Username required!')
], 
HandleValidation.handleValidationErrors,
VerifySignup.checkIfEmailAlreadyExists,
VerifySignup.checkRolesExisted,
AuthController.registerViaEmail)

router.post('/confirmRegistration',[
    body('registrationKey').trim().not().isEmpty().withMessage('Registration key required!'),
    body('password').trim().not().isEmpty().withMessage('Password required!').isLength({min: 6}).withMessage('Minimum length of password is 6 characters'),
    body('password').custom(value =>{
        var complexPasswordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        if(complexPasswordRegex.test(value)){
            return Promise.resolve()
        }
        return Promise.reject('Please enter complex password!')
    })
], 
HandleValidation.handleValidationErrors,
AuthController.confirmRegistration)

router.post('/resetPassword',[
    body('email').trim().not().isEmpty().withMessage('Email required!').isEmail().withMessage('Please enter valid email'),
    body('oldPassword').trim().not().isEmpty().withMessage('Old password required!'),
    body('newPassword').trim().not().isEmpty().withMessage('New password required!')
], HandleValidation.handleValidationErrors, AuthController.resetPassword)

router.post('/login',[
    body('email').trim().not().isEmpty().withMessage('Email required!').isEmail().withMessage('Please enter valid email'),
    body('password').trim().not().isEmpty().withMessage('Password required!')
], HandleValidation.handleValidationErrors, AuthController.login)

router.get('/secret', AuthController.secret)

module.exports = router