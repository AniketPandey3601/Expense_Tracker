const express = require('express');
const router = express.Router();
const Users  = require('../models/index');
const bcrypt = require('bcrypt');


router.post('/',async(req,res)=>{

    const {email , password} = req.body;

    try{

        const user = await Users.findOne({where:{email:email}});
        if(!user){
            return res.status(404).json({message : "User not authorized"});
        }
       
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send("Invalid credentials");
        }
        
        res.json({message:"Logged In" , user: {id : user.id, username :user.username ,email:user.email}});
        
    }
    catch(error){
        console.log(error);

        res.status(500).send(error.message);
    }
})

module.exports = router;