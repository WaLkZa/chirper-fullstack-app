const DataTypes = require('sequelize');

const sequelize = require('../util/database');

const Chirp = sequelize.define('chirps', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        required: true,
        allowNull: false
    },
    dateCreated: {
        type: DataTypes.DATE,
        required: true,
        allowNull: false,
        default: Date.now()
    },
}, {
    timestamps: false
});

module.exports = Chirp;