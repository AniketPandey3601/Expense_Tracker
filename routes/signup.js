
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Users  = require('../models/index');




router.post('/' , async(req , res)=>{
    try{

       const {username , email , password} = req.body

       const existingUser = await Users.findOne({ where: { email: email } });
    if (existingUser) {
      res.status(409).json({ message: "User already exists with the same email address" });
      return;
     
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await Users.create({
        username,
        email,
        password: hashedPassword
    });

    console.log(newUser);
    res.json(newUser);    
    
    }

    catch(err){


        console.log(err)
        res.status(500).send(err.message);

    }
})

module.exports = router;