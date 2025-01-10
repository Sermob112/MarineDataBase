const { ipcMain } = require('electron');
const   {sequelizer, User, Role } = require('./models');
const { Sequelize } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config.json');

class DatabaseInitializer {
  constructor() {

    this.systemDb = new Sequelize(
      "postgres",
      config.DB_USER,
      config.DB_PASSWORD,
      {
          host: config.DB_HOST,
          port: config.DB_PORT,
          dialect: config.DB_DIALECT,
      }
  );

  }

  setupRoutes() {
    ipcMain.handle('check-db-connection', this.checkConnection.bind(this));
    ipcMain.handle('configure-db', async (event, dbConfig) => {
      return await this.configureNewDatabase(dbConfig);   });
  }
  async configureNewDatabase(dbConfig) {
    const { dbName, dbUser, dbPassword, dbHost, dbPort } = dbConfig;

    // Обновляем config.json
    const configPath = path.resolve('./config.json');
    try {
        const configContent = await fs.readFile(configPath, 'utf8');
        const configData = JSON.parse(configContent);
        configData.DB_NAME = dbName;
        configData.DB_USER = dbUser;
        configData.DB_PASSWORD = dbPassword;
        configData.DB_HOST = dbHost;
        configData.DB_PORT = dbPort;

        await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf8');
        console.log('Config updated successfully.');

        // Пересоздаем подключение
        this.systemDb = new Sequelize(dbName, dbUser, dbPassword, {
            host: dbHost,
            port: dbPort,
            dialect: config.DB_DIALECT,
        });
        this.systemDb = new Sequelize(
          dbName,
          dbUser,
          dbPassword,
          {
            dbHost,
            dbPort,
              dialect: config.DB_DIALECT,
          }
      );
      createSequelizeInstance()
        // Проверяем соединение
        await this.systemDb.authenticate();
        console.log('New database connection established.');

        return { status: 'success', message: 'Database connected and config updated.' };
    } catch (error) {
        console.error('Error during database configuration:', error);
        return { status: 'error', message: error.message };
    }
}
// sr
  async  updateConfig(newDbName)
  
  {
    const configPath = path.resolve('../config.json');
    try {
        // console.log(configPath);
        const configContent = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configContent);
        config.DB_NAME = newDbName;
        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
   
        console.log('Config file updated successfully.');
    } catch (error) {
        console.error('Error updating config file:', error);
    }
  }
  
  async checkConnection() {
    try {
      const timeout = 5000; // Максимальное время ожидания 5 секунд
      const connectionPromise = this.systemDb.query('SELECT 1');

      const result = await Promise.race([
        connectionPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), timeout))
      ]);

      return { status: 'connected', dbName: config.DB_NAME  };
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }

  async createDatabase() {
    try {
        await this.systemDb.query('CREATE DATABASE marinebase');
        console.log('Database marinebase created successfully.');
        await this.updateConfig('marinebase');
    
   

        // Создаем новое подключение
        this.systemDbSecond = new Sequelize(
            "marinebase",
            config.DB_USER,
            config.DB_PASSWORD,
            {
                host: config.DB_HOST,
                port: config.DB_PORT,
                dialect: config.DB_DIALECT,
            }
        );

    } catch (error) {
        console.error('Failed to create database:', error);
        throw error;
    }
}

  async syncModels() {
    try {
      console.log("syncModels " + config.DB_NAME);
      await sequelizer.sync({ force: true });
      
    } catch (error) {
      console.error('Failed to synchronize models:', error);
      throw error;
    }
  }

  async createDefaultUsersAndRoles() {
    try {
      const users = [
        { username: 'ad', password: '1' },
        { username: 're', password: '2' },
        { username: 'us', password: '3' },
        { username: 'go', password: '4' },
      ];

      const roles = [
        { name: 'Администратор' },
        { name: 'Редактор' },
        { name: 'Пользователь' },
        { name: 'Гость' },
      ];

      const createdUsers = await Promise.all(users.map(user => User.create(user)));
      const createdRoles = await Promise.all(roles.map(role => Role.create(role)));

      await createdUsers[0].addRole(createdRoles[0].id);
      await createdUsers[1].addRole(createdRoles[1].id);
      await createdUsers[2].addRole(createdRoles[2].id);
      await createdUsers[3].addRole(createdRoles[3].id);

      console.log('Default users and roles created successfully.');
    } catch (error) {
      console.error('Failed to create default users and roles:', error);
      throw error;
    }
  }

  async initialize() {
    try {
      await this.createDatabase();
      await this.syncModels();
      await this.createDefaultUsersAndRoles();
      console.log('Database initialized successfully.');
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  }
}
// (async () => {
//   const db = new DatabaseInitializer();
//  await db.initialize();
// })();
module.exports = DatabaseInitializer;
