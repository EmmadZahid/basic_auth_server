const AuthService = require('../services/auth.service')
const AuthServiceInstance = new AuthService()

exports.register = async (req, res, next) => {
    try {
        const { email, password, username } = req.body
        await AuthServiceInstance.Register(email, password, username)
        return res.status(200).send("User registered successfully!")
    } catch (err) {
        next(err)
    }
}

exports.registerViaEmail = async (req, res, next) => {
    try {
        const { email, username } = req.body
        const code = await AuthServiceInstance.RegisterViaEmail(username, email)
        res.status(200).send(code)
    } catch (err) {
        next(err)
    }
}

exports.confirmRegistration = async (req, res, next) => {
    try {
        const { registrationKey, password, username } = req.body
        await AuthServiceInstance.ConfirmRegistration(registrationKey, password, username)
        return res.status(200).send("Registration successfull!")
    } catch (err) {
        next(err)
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body
        await AuthServiceInstance.ResetPassword(email, oldPassword, newPassword)
        return res.status(200).send("Password changed successfully!");
    } catch (error) {
        next(error)
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const loginObject = await AuthServiceInstance.Login(email, password)        
        return res.status(200).send(loginObject)
    } catch (error) {
        next(error)
    }
}

exports.secret = () => {

}