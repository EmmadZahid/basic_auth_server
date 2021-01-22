const db = require('../models')
const { model } = require('../models/role.model')

checkIfEmailAlreadyExists = async (req, res, next) => {
    try {
        const { email } = req.body
        let user = await db.user.findOne({ email: email })
        if (user) {
            let error = new Error("User email already exists.")
            error.statusCode = 400
            throw error
        }
        next()
    } catch (error) {
        next(error)
    }
}

checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!db.ROLES.includes(req.body.roles[i])) {
                res.status(400).send(`Failed! Role ${req.body.roles[i]} does not exist!`);
                return;
            }
        }
    }

    next();
};

module.exports = {
    checkIfEmailAlreadyExists,
    checkRolesExisted
}