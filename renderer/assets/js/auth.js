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