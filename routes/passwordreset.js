const express = require('express');
const router = express.Router();

const passwordController = require('../controllers/passwordController')



router.post('/forgotpassword', passwordController.forgotpassword);

router.get('/resetpassword/:uuid',passwordController.passwordreset);


router.post('/reset',passwordController.reset );


module.exports = router;