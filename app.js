const express = require('express');
const bodyParser = require('body-parser');
const signuproutes = require('./routes/signup');
const loginroutes = require('./routes/login')

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
const sequelize = require('./models/index');
const Users = require('./models/index')

app.use('/signup',signuproutes);
app.use('/login' , loginroutes);



sequelize.sync().then(() => {
    app.listen(3000, () => {
      console.log(`Server is running on port 3000`);
    });
  });