const { BrowserWindow } = require('electron');
const { UserLog } = require('./models');

class WindowManager {
  constructor(auth) {
    this.mainWindow = null;
    this.auth = auth;
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      show: false,
    });

    this.mainWindow.on('close', this.handleClose.bind(this));
    this.mainWindow.loadFile('renderer/index.html');
    this.auth.setMainWindow(this.mainWindow);
  }

  async handleClose(event) {
    if (this.mainWindow && this.mainWindow.webContents.session.userLogId) {
      event.preventDefault();
      try {
        await UserLog.update(
          { logout_time: new Date() },
          { where: { Id: this.mainWindow.webContents.session.userLogId } }
        );
        BrowserWindow.getAllWindows().forEach(win => win.destroy());
        app.quit();
      } catch (error) {
        console.error('Ошибка при обновлении времени выхода:', error);
        app.quit();
      }
    } else {
      app.quit();
    }
  }
}

module.exports = WindowManager;
