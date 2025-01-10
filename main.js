const { app } = require('electron');
const Auth = require('./utility/auth');
const AdminRoutes = require('./back/adminBack');
const WindowManager = require('./utility/windowManager');
const createCustomMenu = require('./utility/menuManager');
const ShipBaseBack = require('./back/shipBaseBack');
const AnalyzeData = require('./back/analiz');
const auth = new Auth();
new AdminRoutes();
const windowManager = new WindowManager(auth);
new ShipBaseBack();
new AnalyzeData();

app.on('ready', () => {
  windowManager.createMainWindow();
  auth.createAuthWindow();
  createCustomMenu();
  // importCsvToDatabase();
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
