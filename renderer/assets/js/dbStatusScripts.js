const { ipcRenderer } = require('electron');

async function updateDbStatus() {
  try {
    const status = await ipcRenderer.invoke('check-db-connection');
    const dbIndicator = document.getElementById('db-indicator');
    const dbMessage = document.getElementById('db-message');
    
    if (status.status === 'connected') {
      dbIndicator.style.backgroundColor = 'green'; // Индикатор для успешного подключения
      dbMessage.textContent = `Connected to ${status.dbName}`;
    } else {
      dbIndicator.style.backgroundColor = 'red'; // Индикатор для неудачного подключения
      dbMessage.textContent = `Disconnected: ${status.error}`;
    }
  } catch (error) {
    console.error('Error updating DB status:', error);
  }
}
window.onload = updateDbStatus;