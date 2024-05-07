const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken')
const loginController = require('../controllers/loginController')




router.post('/',loginController.login)



module.exports = router;