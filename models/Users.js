const sequelize = require('./index');
const { Sequelize, DataTypes } = require('sequelize');

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

    },
    isPremium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false 
    }


});

module.exports = Users;