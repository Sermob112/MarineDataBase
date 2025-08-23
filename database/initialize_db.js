const { ipcMain } = require('electron');
const db = require('./db');         
const models = require('./models'); 
const { Sequelize } = require('sequelize');
const { getConfigSync, saveConfigSync } = require('../utility/config');

class DatabaseInitializer {
  constructor() {
    const cfg = getConfigSync();
    this.systemDb = new Sequelize('postgres', cfg.DB_USER, cfg.DB_PASSWORD, {
      host: cfg.DB_HOST,
      port: cfg.DB_PORT,
      dialect: cfg.DB_DIALECT,
    });
  }

  setupRoutes() {
    ipcMain.handle('check-db-connection', this.checkConnection.bind(this));
    ipcMain.handle('configure-db', async (_event, dbConfig) => {
      return await this.configureNewDatabase(dbConfig);
    });
    ipcMain.handle('apply-db-config', async (_e, cfg) => {
      return await this.applyDbConfigNow(cfg);
    });
  
     
  ipcMain.handle('get-db-config', async () => getConfigSync());
  }

  async configureNewDatabase(dbConfig) {
    const { dbName, dbUser, dbPassword, dbHost, dbPort } = dbConfig;
    try {
      // 1) Сохраняем ТОЛЬКО в userData
      const next = saveConfigSync({
        DB_NAME: dbName,
        DB_USER: dbUser,
        DB_PASSWORD: dbPassword,
        DB_HOST: dbHost,
        DB_PORT: dbPort
      });

      // 2) Пересоздаём сервисное подключение к системной БД
      this.systemDb = new Sequelize('postgres', next.DB_USER, next.DB_PASSWORD, {
        host: next.DB_HOST,
        port: next.DB_PORT,
        dialect: next.DB_DIALECT
      });
      await this.systemDb.authenticate();
      await db.resetSequelize();

      return { status: 'success', message: 'Database connected and config saved to userData.' };
    } catch (error) {
      console.error('Error during database configuration:', error);
      return { status: 'error', message: error.message };
    }
  }
  async ensureDatabase(dbName) {
    const [rows] = await this.systemDb.query(
      'SELECT 1 FROM pg_database WHERE datname = :name',
      { replacements: { name: dbName } }
    );
    if (rows.length) return 'exists';
  
    const safe = dbName.replace(/"/g, '""');
    try {
      await this.systemDb.query(`CREATE DATABASE "${safe}"`);
      console.log(`Database ${dbName} created successfully.`);
      return 'created';
    } catch (e) {
      if (e?.parent?.code === '42P04') return 'exists'; // already exists
      throw e;
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
      const timeout = 5000;
      await Promise.race([
        this.systemDb.query('SELECT 1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), timeout))
      ]);
      const cfg = getConfigSync();
      return { status: 'connected', dbName: cfg.DB_NAME };
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }
  
 // database/initialize_db.js
async applyDbConfigNow({ dbName, dbUser, dbPassword, dbHost, dbPort, dialect = 'postgres' }) {
  try {
    // 1) сохранить конфиг в userData (создастся, если нет)
    const next = saveConfigSync({
      DB_NAME: dbName,
      DB_USER: dbUser,
      DB_PASSWORD: dbPassword,
      DB_HOST: dbHost,
      DB_PORT: Number(dbPort),
      DB_DIALECT: dialect
    });

    // 2) системное соединение к СУЩЕСТВУЮЩЕЙ БД 'postgres'
    this.systemDb = new Sequelize('postgres', next.DB_USER, next.DB_PASSWORD, {
      host: next.DB_HOST,
      port: next.DB_PORT,
      dialect: next.DB_DIALECT
    });
    await this.systemDb.authenticate();

    // 3) УБЕДИТЬСЯ, ЧТО ЦЕЛЕВАЯ БД ЕСТЬ (создать при необходимости)
    await this.ensureDatabase(next.DB_NAME); // <= ВАЖНО: до resetSequelize()

    // 4) переинициализировать ORM на новую БД
    await db.resetSequelize();              // <= обязательно await
    await db.sequelizer.authenticate();     // sanity check

    // 5) синхронизация и сиды
    await this.syncModels('safe');          // или 'alter'
    await this.seedIfEmpty();

    return { status: 'success', message: 'Настройки применены, БД проверена, модели синхронизированы.' };
  } catch (err) {
    console.error('applyDbConfigNow error:', err);
    return { status: 'error', message: err.message };
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

async syncModels(mode = 'safe') {
  const sequelize = db.sequelizer;               // всегда свежий
  const cfg = getConfigSync();
  console.log('syncModels ' + cfg.DB_NAME);

  if (mode === 'force')      await sequelize.sync({ force: true });
  else if (mode === 'alter') await sequelize.sync({ alter: true });
  else                       await sequelize.sync();
}

async createDefaultUsersAndRoles() {
  const t = await db.sequelizer.transaction();
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

    // создаём/находим роли
    const roleMap = {};
    for (const r of roles) {
      const [role] = await models.Role.findOrCreate({
        where: { name: r.name }, defaults: r, transaction: t
      });
      roleMap[r.name] = role;
    }

    // создаём/находим пользователей
    const userMap = {};
    for (const u of users) {
      const [user] = await models.User.findOrCreate({
        where: { username: u.username }, defaults: u, transaction: t
      });
      userMap[u.username] = user;
    }

    // связи (belongsToMany)
    await userMap['ad'].addRole(roleMap['Администратор'], { transaction: t });
    await userMap['re'].addRole(roleMap['Редактор'], { transaction: t });
    await userMap['us'].addRole(roleMap['Пользователь'], { transaction: t });
    await userMap['go'].addRole(roleMap['Гость'], { transaction: t });

    await t.commit();
    console.log('Default users and roles created successfully.');
  } catch (error) {
    await t.rollback();
    console.error('Failed to create default users and roles:', error);
    throw error;
  }
}

async initialize() {
  try {
    const cfg = getConfigSync();

    // системный коннект к postgres должен быть уже создан в constructor()
    await this.ensureDatabase(cfg.DB_NAME); // ← сначала убедились, что БД есть

    await db.resetSequelize();              // ← переключились ORM
    await db.sequelizer.authenticate();

    await this.syncModels('safe');          // или 'alter'
    await this.seedIfEmpty();

    console.log('Database initialized successfully.');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}



  // Добавь метод в класс DatabaseInitializer:
async seedIfEmpty() {
  // ⚠️ брать модели только из контейнера
  const [u, r] = await Promise.all([
    models.User.count(),
    models.Role.count()
  ]);
  if (u > 0 || r > 0) {
    console.log('Seed skipped: tables are not empty.');
    return;
  }
  await this.createDefaultUsersAndRoles(); // твой метод, см. улучшенную версию ниже
}
}


// (async () => {
//   const db = new DatabaseInitializer();
//  await db.initialize();
// })();
module.exports = DatabaseInitializer;
