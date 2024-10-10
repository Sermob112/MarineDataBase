const { sequelize, User, Role } = require('./models');
const { Sequelize } = require('sequelize');

class DatabaseInitializer {
  constructor() {
    this.systemDb = new Sequelize('postgres', 'postgres', 'sa', {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
    });
  }

  async createDatabase() {
    try {
      await this.systemDb.query('CREATE DATABASE marinebase');
      console.log('Database marinebase created successfully.');
    } catch (error) {
      console.error('Failed to create database:', error);
      throw error;
    }
  }

  async syncModels() {
    try {
      await sequelize.sync({ force: true });
      console.log('Models synchronized successfully.');
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

module.exports = DatabaseInitializer;


