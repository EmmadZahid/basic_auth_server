const express = require('express')
const router = express.Router()
const { authJwt } = require('../middlewares')
const userController = require('../controllers/user.controller')

router.get('/publicBoard', userController.publicBoard)
router.get('/userBoard', [authJwt.verifyToken], userController.userBoard)
router.get('/modBoard', [authJwt.verifyToken, authJwt.isModerator], userController.modBoard)
router.get('/adminBoard', [authJwt.verifyToken, authJwt.isAdmin], userController.adminBoard)

module.exports = router
