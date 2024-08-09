const { app, BrowserWindow } = require('electron');
const { createAuthWindow, setMainWindow } = require('./auth');

let mainWindow;

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

  mainWindow.loadFile('index.html');
  setMainWindow(mainWindow); // Передаем окно в auth.js
}

app.on('ready', () => {
  createMainWindow();
  createAuthWindow();
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
  }
});
