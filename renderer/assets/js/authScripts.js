const { ipcRenderer } = require('electron');

document.getElementById('auth-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  ipcRenderer.send('auth-submit', { username, password });
});

document.getElementById('close-btn').addEventListener('click', () => {
  ipcRenderer.send('close-auth-window');
});
document.getElementById('minimize-btn').addEventListener('click', () => {
    ipcRenderer.send('minimize-auth-window');
  });
ipcRenderer.on('auth-failure', (event, message) => {
  document.getElementById('error-message').innerText = message;
});

ipcRenderer.on('login-success', () => {
  ipcRenderer.send('login-success');
});
const authScreen = document.getElementById("auth-screen");
const dbSettingsScreen = document.getElementById("db-settings-screen");
const switchToDbSettings = document.getElementById("switch-to-db-settings");
const switchToAuth = document.getElementById("switch-to-auth");

switchToDbSettings.addEventListener("click", () => {
  authScreen.style.display = "none";
  dbSettingsScreen.style.display = "block";
});

switchToAuth.addEventListener("click", () => {
  dbSettingsScreen.style.display = "none";
  authScreen.style.display = "block";
});

async function updateDbStatus() {
  try {
    const status = await ipcRenderer.invoke('check-db-connection');
    const dbIndicator = document.getElementById('db-indicator');
    const dbMessage = document.getElementById('db-message');
    
    if (status.status === 'connected') {
      dbIndicator.style.backgroundColor = 'green'; // Индикатор для успешного подключения
      dbMessage.textContent = `Поключен к  ${status.dbName}`;
    } else {
      dbIndicator.style.backgroundColor = 'red'; // Индикатор для неудачного подключения
      dbMessage.textContent = `Не поключен: ${status.error}`;
    }
  } catch (error) {
    console.error('Error updating DB status:', error);
  }
}
window.onload = updateDbStatus;

document.getElementById('connect-db').addEventListener('click', async () => {
  const dbConfig = {
      dbName: document.getElementById('db-name').value,
      dbUser: document.getElementById('db-user').value,
      dbPassword: document.getElementById('db-password').value,
      dbHost: document.getElementById('db-host').value,
      dbPort: parseInt(document.getElementById('db-port').value, 10),
  };

  try {
      const result = await ipcRenderer.invoke('configure-db', dbConfig);
      const messageElement = document.getElementById('db-config-result');
      if (result.status === 'success') {
          messageElement.style.color = 'green';
          messageElement.textContent = result.message;
      } else {
          messageElement.style.color = 'red';
          messageElement.textContent = result.message;
      }
  } catch (error) {
      console.error('Error configuring database:', error);
  }
});