const express = require('express')
const router = express.Router()
const usersController = require('../controllers/user.controller')


router.get('/',usersController.getAllUsers);
router.post('/register',usersController.register);
router.post('/login',usersController.login)






module.exports = router;