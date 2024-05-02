const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./index')


const S3File = sequelize.define('S3File', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = S3File;