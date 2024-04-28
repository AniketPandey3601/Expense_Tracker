const express = require('express');
const bodyParser = require('body-parser');
const signuproutes = require('./routes/signup');
const loginroutes = require('./routes/login')
const expensesroutes = require('./routes/expense')

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
const sequelize = require('./models/index');
const Users = require('./models/Users')
const Expense = require('./models/expenses')


Users.hasMany(Expense);
Expense.belongsTo(Users);

app.use('/signup',signuproutes);
app.use('/login' , loginroutes);
app.use('/expenses' , expensesroutes);



sequelize.sync().then(() => {
    app.listen(3000, () => {
      console.log(`Server is running on port 3000`);
    });
  });