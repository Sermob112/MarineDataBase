// database/db.js
const { Sequelize } = require('sequelize');
const { getConfigSync } = require('../utility/config');
const models = require('./models');

const createSequelizeInstance = () => {
  const cfg = getConfigSync();
  return new Sequelize(cfg.DB_NAME, cfg.DB_USER, cfg.DB_PASSWORD, {
    host: cfg.DB_HOST,
    port: cfg.DB_PORT,
    dialect: cfg.DB_DIALECT,
  });
};

let sequelizer = createSequelizeInstance();
models.initModels(sequelizer);

async function resetSequelize() {
  const old = sequelizer;

  // 1) создаём новый и сразу публикуем наружу
  sequelizer = createSequelizeInstance();
  module.exports.sequelizer = sequelizer;

  // 2) привязываем модели к новому
  models.initModels(sequelizer);

  // 3) проверяем коннект (по желанию)
  await sequelizer.authenticate().catch(() => { /* лог при желании */ });

  // 4) закрываем старый (после публикации нового)
  try { if (old) await old.close(); } catch {}

  return sequelizer;
}

module.exports = { sequelizer, createSequelizeInstance, resetSequelize };
