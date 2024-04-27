const express = require('express');
const bodyParser = require('body-parser');

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
const sequelize = require('./models/index');
const Users = require('./models/index')

app.post('/signup' , async(req , res)=>{
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

sequelize.sync().then(() => {
    app.listen(3000, () => {
      console.log(`Server is running on port 3000`);
    });
  });