const { BrowserWindow, ipcMain, app } = require('electron');
const { User } = require('./models'); 
let authWindow;
let mainWindow;

function createAuthWindow() {
  authWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false,
    frame: false,
  });

  authWindow.loadFile('auth.html');

  authWindow.once('ready-to-show', () => {
    authWindow.show();
  });

  ipcMain.on('minimize-auth-window', () => {
    if (authWindow) {
      authWindow.minimize();
    }
  });

  ipcMain.on('close-auth-window', () => {
    if (authWindow) {
      authWindow.close();
      authWindow = null;

      // Если главное окно не было открыто, закрываем приложение
      if (!mainWindow || !mainWindow.isVisible()) {
        app.quit();
      }
    }
  });

  ipcMain.on('auth-submit', async (event, credentials) => {
    const { username, password } = credentials;

    try {
        const user = await User.findOne({ where: { username, password } });
        if (user) {
            event.sender.send('login-success');
        } else {
            event.sender.send('auth-failure', 'Неверный логин или пароль.');
        }
    } catch (error) {
        event.sender.send('auth-failure', 'Ошибка авторизации.');
    }
  });

  ipcMain.on('login-success', () => {
    if (authWindow) {
      authWindow.close();
      authWindow = null;
    }
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

module.exports = {
  createAuthWindow,
  setMainWindow: (window) => { mainWindow = window; }
};
