const express = require('express');
const bodyParser = require('body-parser');

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.post('/signup' , async(req , res)=>{
    try{

       const {username , email , password} = req.body

        console.log(req.body);
        res.json(req.body);
    
    
    }

    catch(err){


        console.log(err)

    }
})

app.listen(3000)