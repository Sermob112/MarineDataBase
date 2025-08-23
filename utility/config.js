// utility/config.js
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

function getAppName() {
  try { return app.getName(); } catch { return 'Idle App'; }
}

function getDefaultConfigPath() {
  const base = (app && app.isPackaged) ? process.resourcesPath : path.resolve(__dirname, '..');
  return path.join(base, 'config.json'); // дефолтный конфиг кладёшь в build.files
}

function getUserConfigPath() {
  let userDir;
  try {
    userDir = app.getPath('userData');
  } catch {
    // Фоллбек до ready (на всякий случай)
    const home = process.env.HOME || process.env.USERPROFILE || '';
    if (process.platform === 'win32') {
      const base = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
      userDir = path.join(base, getAppName());
    } else if (process.platform === 'darwin') {
      userDir = path.join(home, 'Library', 'Application Support', getAppName());
    } else {
      userDir = path.join(home, '.config', getAppName());
    }
  }
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
  return path.join(userDir, 'config.json');
}

function ensureUserConfig() {
  const userPath = getUserConfigPath();
  if (!fs.existsSync(userPath)) {
    const defPath = getDefaultConfigPath();
    if (fs.existsSync(defPath)) {
      fs.copyFileSync(defPath, userPath);
    } else {
      // минимальные значения по умолчанию
      const defaults = {
        DB_NAME: 'marinebase',
        DB_USER: 'postgres',
        DB_PASSWORD: '',
        DB_HOST: '127.0.0.1',
        DB_PORT: 5432,
        DB_DIALECT: 'postgres'
      };
      fs.writeFileSync(userPath, JSON.stringify(defaults, null, 2), 'utf8');
    }
  }
  return userPath;
}

function getConfigSync() {
  const userPath = ensureUserConfig();
  return JSON.parse(fs.readFileSync(userPath, 'utf8'));
}

function saveConfigSync(partial) {
  const userPath = ensureUserConfig();
  const current = JSON.parse(fs.readFileSync(userPath, 'utf8'));
  const next = { ...current, ...partial };
  fs.writeFileSync(userPath, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

module.exports = {
  getConfigSync,
  saveConfigSync,
  getUserConfigPath,
  getDefaultConfigPath
};
