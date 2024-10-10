const { BrowserWindow, ipcMain, app } = require('electron');
const { User, UserLog } = require('./models');
const DatabaseInitializer = require('./initialize_db');

class Auth {
  constructor() {
    this.authWindow = null;
    this.mainWindow = null;
    this.dbInitializer = new DatabaseInitializer();
    this.initializeDatabase();
    this.setupIPCHandlers();
  }

  async initializeDatabase() {
    try {
      const success = await this.dbInitializer.initialize();
      if (success) {
        console.log('Database setup completed successfully.');
      } else {
        console.log('Database setup failed.');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  createAuthWindow() {
    this.authWindow = new BrowserWindow({
      width: 600,
      height: 400,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      show: false,
      frame: false,
    });

    this.authWindow.loadFile('renderer/auth.html');

    this.authWindow.once('ready-to-show', () => {
      this.authWindow.show();
    });
  }

  setupIPCHandlers() {
    ipcMain.on('minimize-auth-window', () => {
      if (this.authWindow) {
        this.authWindow.minimize();
      }
    });

    ipcMain.on('close-auth-window', () => {
      if (this.authWindow) {
        this.authWindow.close();
        this.authWindow = null;

        if (!this.mainWindow || !this.mainWindow.isVisible()) {
          app.quit();
        }
      }
    });

    ipcMain.on('auth-submit', async (event, credentials) => {
      const { username, password } = credentials;

      try {
        const user = await User.findOne({ where: { username, password } });
        if (user) {
          const loginLog = await UserLog.create({
            username: user.username,
            login_time: new Date(),
          });

          event.sender.session.userLogId = loginLog.Id;
          event.sender.send('login-success');
        } else {
          event.sender.send('auth-failure', 'Неверный логин или пароль.');
        }
      } catch (error) {
        event.sender.send('auth-failure', 'Ошибка авторизации.');
      }
    });

    ipcMain.on('login-success', (event) => {
      if (this.authWindow) {
        this.authWindow.close();
        this.authWindow = null;
      }
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.webContents.session.currentUser = event.sender.session.currentUser;
        this.mainWindow.webContents.session.userLogId = event.sender.session.userLogId;
      }
    });

    ipcMain.on('logout', async (event) => {
      try {
        const logId = event.sender.session.userLogId;
        if (logId) {
          await UserLog.update(
            { logout_time: new Date() },
            { where: { Id: logId } }
          );
        }

        if (this.mainWindow) {
          this.mainWindow.hide();
        }
        this.createAuthWindow();
      } catch (error) {
        console.error('Ошибка при выходе из системы:', error);
      }
    });
  }

  setMainWindow(window) {
    this.mainWindow = window;
    if (!this.mainWindow.webContents.session) {
      this.mainWindow.webContents.session = { currentUser: null, userLogId: null };
    }
  }
}

module.exports = Auth;