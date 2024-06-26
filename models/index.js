const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME ,process.env.DB_USER, process.env.DATABASE_PASS, {
  dialect: 'mysql',
  host: process.env.DB_HOST
});


module.exports = sequelize;