
const express = require('express');
const router = express.Router();

const Users  = require('../models/index');




router.post('/' , async(req , res)=>{
    try{

       const {username , email , password} = req.body

       const existingUser = await Users.findOne({ where: { email: email } });
    if (existingUser) {
      res.status(409).json({ message: "User already exists with the same email address" });
      return;
     
    }
       const newUser = await Users.create({username , email,password});

        console.log(newUser);
        res.json(newUser);
    
    
    }

    catch(err){


        console.log(err)
        res.status(500).send(err.message);

    }
})

module.exports = router;