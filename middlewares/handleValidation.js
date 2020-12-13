const {validationResult} = require('express-validator')
handleValidationErrors = (req, res, next) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        let error = new Error(errors.array()[0].msg)
        error.statusCode = 400 
        next(error)
        return
    }

    next()
}

module.exports = {
    handleValidationErrors
}