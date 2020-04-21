const DataTypes = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = User;