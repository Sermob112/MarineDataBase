const { app, BrowserWindow,Menu } = require('electron');
const { createAuthWindow, setMainWindow } = require('./auth');
const { setupAdminRoutes } = require('./adminBack');
const { UserLog } = require('./models'); // Подключаем модель UserLog
let mainWindow;
let currentUser = null;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
     
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false // не показывать основное окно сразу
  });

  mainWindow.on('close', async (event) => {
    if (mainWindow && mainWindow.webContents.session.userLogId) {
      event.preventDefault();
      try {
        await UserLog.update(
          { logout_time: new Date() },
          { where: { Id: mainWindow.webContents.session.userLogId } }
        );
        // После обновления лога, закрываем все окна и выходим
        BrowserWindow.getAllWindows().forEach(win => win.destroy());
        app.quit();
      } catch (error) {
        console.error('Ошибка при обновлении времени выхода:', error);
        app.quit();
      }
    } else {
      app.quit();
    }
  });

  mainWindow.loadFile('renderer/index.html');
  setMainWindow(mainWindow); 

}
// Функция для создания кастомного меню
function createCustomMenu() {
  const template = [
    {
      label: 'Файл', 
      submenu: [
        // { label: 'Создать', click() { /* Ваш код для создания файла */ } }, // "New"
        // { label: 'Открыть', click() { /* Ваш код для открытия файла */ } }, // "Open"
        // { label: 'Сохранить', click() { /* Ваш код для сохранения файла */ } }, // "Save"
        // { label: 'Сохранить как...', click() { /* Ваш код для сохранения файла под новым именем */ } }, // "Save As"
        // { type: 'separator' },
        { label: 'Выход', role: 'quit' } // "Quit"
      ]
    },
    {
      label: 'Правка', // "Edit"
      submenu: [
        { label: 'Отменить', role: 'undo' },  // "Undo"
        { label: 'Повторить', role: 'redo' }, // "Redo"
        { type: 'separator' },
        { label: 'Вырезать', role: 'cut' },   // "Cut"
        { label: 'Копировать', role: 'copy' }, // "Copy"
        { label: 'Вставить', role: 'paste' },  // "Paste"
        { label: 'Выбрать все', role: 'selectAll' } // "Select All"
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { label: 'Обновить', role: 'reload' },           // "Reload"
        { label: 'Перезагрузить', role: 'forceReload' }, // "Force Reload"
        { type: 'separator' },
        { label: 'Масштаб по умолчанию', role: 'resetZoom' }, // "Actual Size"
        { label: 'Увеличить', role: 'zoomIn' },               // "Zoom In"
        { label: 'Уменьшить', role: 'zoomOut' },              // "Zoom Out"
        { type: 'separator' },
        { label: 'На весь экран', role: 'togglefullscreen' } // "Toggle Full Screen"
      ]
    },
    {
      label: 'Окно', // "Window"
      submenu: [
        { label: 'Свернуть', role: 'minimize' }, // "Minimize"
        { label: 'Закрыть', role: 'close' }      // "Close"
      ]
    },
    {
      label: 'Помощь', 
      submenu: [
        { label: 'О программе', role: 'about' } // "About"
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
  createMainWindow();
  createAuthWindow();
  createCustomMenu();
  setupAdminRoutes();


});
app.on('before-quit', async (event) => {
  if (mainWindow && mainWindow.webContents.session.userLogId) {
      event.preventDefault();
      try {
          await UserLog.update(
              { logout_time: new Date() },
              { where: { Id: mainWindow.webContents.session.userLogId } }
          );
          // После обновления лога, закрываем все окна и выходим
          BrowserWindow.getAllWindows().forEach(win => win.destroy());
          app.quit();
      } catch (error) {
          console.error('Ошибка при обновлении времени выхода:', error);
          app.quit();
      }
  } else {
      app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
    createAuthWindow();
    createCustomMenu();

  }
});
