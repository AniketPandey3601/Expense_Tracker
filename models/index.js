const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('expensetracker', 'root', 'An12Pa99@', {
  dialect: 'mysql',
  host: 'localhost',
});

const Users = sequelize.define('Users', {

    username :{
        
       type: DataTypes.STRING,
    allowNull:false,


} ,
    email:{
        
        type:DataTypes.STRING,
        allowNull:false,
        unique:true

    
    },

    password:{
        type:DataTypes.STRING,
        allowNull:false

    }


});

module.exports = Users;