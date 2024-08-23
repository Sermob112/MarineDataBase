const { BrowserWindow, ipcMain, app } = require('electron');
const { User, UserLog} = require('./models'); 
const { initializeDatabase } = require('./initialize_db');
let authWindow;
let mainWindow;
// initializeDatabase().then(success => {
//   if (success) {
//       console.log('Database setup completed successfully.');
//   } else {
//       console.log('Database setup failed.');
//   }
// });
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

  authWindow.loadFile('renderer/auth.html');

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
        // Добавляем запись в лог после успешной авторизации
        const loginLog = await UserLog.create({
          username: user.username,
          login_time: new Date(), // Текущее время для записи времени входа
        });
  
        // Сохраняем ID логирования, чтобы позже обновить время выхода
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
    if (authWindow) {
      authWindow.close();
      authWindow = null;
    }
    if (mainWindow) {
      mainWindow.show();
      // Передаем информацию о текущем пользователе в mainWindow
      mainWindow.webContents.session.currentUser = event.sender.session.currentUser; // Предполагая, что вы где-то сохраняете текущего пользователя
      mainWindow.webContents.session.userLogId = event.sender.session.userLogId;
    }
  });
}
ipcMain.on('logout', async (event) => {
  try {
    const logId = event.sender.session.userLogId;
    if (logId) {
      await UserLog.update(
        { logout_time: new Date() }, // Текущее время для времени выхода
        { where: { Id: logId } }
      );
    }

    // Закрываем основное окно и открываем окно авторизации
    if (mainWindow) {
      mainWindow.hide();
    }
    createAuthWindow();
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
  }
});
module.exports = {
  createAuthWindow,
  setMainWindow: (window) => {
    mainWindow = window;
    // Убедитесь, что у mainWindow есть доступ к session
    if (!mainWindow.webContents.session) {
      mainWindow.webContents.session = { currentUser: null, userLogId: null };
    }
  }
};