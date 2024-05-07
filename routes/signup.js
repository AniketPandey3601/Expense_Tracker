
const express = require('express');
const router = express.Router();



const signupController = require('../controllers/Signupcontroller')




router.post('/' ,signupController.signup)

module.exports = router;