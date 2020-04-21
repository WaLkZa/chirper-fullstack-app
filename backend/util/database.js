const Sequelize = require('sequelize').Sequelize; // .Sequelize is required for intellisense in VSCode

const sequelize = new Sequelize('chirper_fullstack', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = sequelize;