const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('marinebase', 'postgres', 'sa', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432
});

module.exports = sequelize;