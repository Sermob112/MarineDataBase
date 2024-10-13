const { app } = require('electron');
const Auth = require('./auth');
const AdminRoutes = require('./adminBack');
const WindowManager = require('./windowManager');
const createCustomMenu = require('./menuManager');
const  importCsvToDb = require('./csvReader')
const auth = new Auth();
const adminRoutes = new AdminRoutes();
const windowManager = new WindowManager(auth);

app.on('ready', () => {
  windowManager.createMainWindow();
  auth.createAuthWindow();
  createCustomMenu();
  // importCsvToDb();
});

app.on('before-quit', async (event) => {
  await windowManager.handleClose(event); 
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow();
    auth.createAuthWindow();
    createCustomMenu();
  }
});
