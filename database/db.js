const config = require('../config.json');
const { Sequelize } = require('sequelize');

const createSequelizeInstance = () => {

  return new Sequelize(
    config.DB_NAME,
    config.DB_USER,
    config.DB_PASSWORD,
    {
      host: config.DB_HOST,
      port: config.DB_PORT,
      dialect: config.DB_DIALECT,
    }
  );
};

let sequelizer = createSequelizeInstance();
  
module.exports = { sequelizer, createSequelizeInstance };