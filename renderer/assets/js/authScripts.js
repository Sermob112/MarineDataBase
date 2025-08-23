// renderer/assets/js/authScripts.js
const { ipcRenderer } = require('electron');

// ====== ЛОГИН (как было) ======
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
ipcRenderer.on('auth-failure', (_event, message) => {
  document.getElementById('error-message').innerText = message;
});
ipcRenderer.on('login-success', () => {
  ipcRenderer.send('login-success');
});

// ====== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ (как было) ======
const authScreen = document.getElementById("auth-screen");
const dbSettingsScreen = document.getElementById("db-settings-screen");
const switchToDbSettings = document.getElementById("switch-to-db-settings");
const switchToAuth = document.getElementById("switch-to-auth");

switchToDbSettings.addEventListener("click", () => {
  authScreen.style.display = "none";
  dbSettingsScreen.style.display = "block";
  prefillDbForm(); // NEW: при открытии вкладки — подставить значения из конфига
  updateDbStatus(); // NEW: и обновить индикатор
});

switchToAuth.addEventListener("click", () => {
  dbSettingsScreen.style.display = "none";
  authScreen.style.display = "block";
});

// ====== DB STATUS ======
async function updateDbStatus() {
  try {
    const status = await ipcRenderer.invoke('check-db-connection');
    const dbIndicator = document.getElementById('db-indicator');
    const dbMessage = document.getElementById('db-message');

    if (status.status === 'connected') {
      dbIndicator.style.backgroundColor = 'green';
      dbMessage.textContent = `Подключен к ${status.dbName}`;
    } else {
      dbIndicator.style.backgroundColor = 'red';
      dbMessage.textContent = `Не подключен: ${status.error || 'нет соединения'}`;
    }
  } catch (error) {
    console.error('Error updating DB status:', error);
  }
}

// ====== PREFILL: получить текущую конфигурацию и показать в форме ======
async function prefillDbForm() {
  try {
    const cfg = await ipcRenderer.invoke('get-db-config'); // NEW
    if (!cfg) return;

    const nameEl = document.getElementById('db-name');
    const userEl = document.getElementById('db-user');
    const passEl = document.getElementById('db-password');
    const hostEl = document.getElementById('db-host');
    const portEl = document.getElementById('db-port');

    if (nameEl) nameEl.value = cfg.DB_NAME ?? '';
    if (userEl) userEl.value = cfg.DB_USER ?? '';
    if (passEl) passEl.value = cfg.DB_PASSWORD ?? '';
    if (hostEl) hostEl.value = cfg.DB_HOST ?? 'localhost';
    if (portEl) portEl.value = cfg.DB_PORT ?? 5432;
  } catch (e) {
    console.error('prefillDbForm error:', e);
  }
}

// ====== APPLY: сохранить и сразу подключиться (без рестарта) ======
document.getElementById('connect-db').addEventListener('click', async () => {
  const btn = document.getElementById('connect-db');
  const out = document.getElementById('db-config-result');

  // собрать значения
  const payload = {
    dbName: document.getElementById('db-name').value.trim(),
    dbUser: document.getElementById('db-user').value.trim(),
    dbPassword: document.getElementById('db-password').value, // пароль оставляем как есть
    dbHost: document.getElementById('db-host').value.trim() || 'localhost',
    dbPort: parseInt(document.getElementById('db-port').value, 10) || 5432
  };

  // простая валидация
  if (!payload.dbName || !payload.dbUser) {
    out.style.color = 'red';
    out.textContent = 'Укажите имя базы и пользователя.';
    return;
  }

  btn.disabled = true;
  out.style.color = '';
  out.textContent = 'Подключаюсь…';

  try {
    // ВАЖНО: раньше здесь вызывался 'configure-db' — меняем на 'apply-db-config'
    const res = await ipcRenderer.invoke('apply-db-config', payload); // NEW (горячее применение)

    if (res.status === 'success') {
      out.style.color = 'green';
      out.textContent = 'Настройки применены, подключение обновлено.';
      await updateDbStatus(); // сразу обновим индикатор
    } else {
      out.style.color = 'red';
      out.textContent = res.message || 'Ошибка применения настроек';
    }
  } catch (error) {
    console.error('Error applying database config:', error);
    out.style.color = 'red';
    out.textContent = error.message || 'Ошибка подключения';
  } finally {
    btn.disabled = false;
  }
});

// при открытии окна — сразу статус + префилл
window.addEventListener('DOMContentLoaded', () => {
  prefillDbForm();   // NEW
  updateDbStatus();  // было
});
