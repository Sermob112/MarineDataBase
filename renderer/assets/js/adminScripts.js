// assets/js/adminScripts.js — переписано целиком

(function () {
    // ---------- IPC (Electron) ----------
    function resolveIPC() {
      if (window.electron?.ipcRenderer) return window.electron.ipcRenderer;
      try { return require('electron').ipcRenderer; } catch { /* no-op */ }
      console.warn('[admin] ipcRenderer недоступен. Проверь preload/настройки контекста.');
      return null;
    }
    const ipc = resolveIPC();
  
    // ---------- Утилиты ----------
    const $  = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  
    function on(el, ev, cb, opts){ el && el.addEventListener(ev, cb, opts); }
    function show(el, v=true){ if (el) el.style.display = v ? '' : 'none'; }
  
    function toast(msg){ alert(msg); } // можешь заменить на свою систему уведомлений
  
    // ---------- Модалка редактирования ----------
    function ensureEditModal() {
      let modal = $('#editUserModal');
      if (!modal) {
        // если в верстке нет контейнера — создадим
        modal = document.createElement('div');
        modal.id = 'editUserModal';
        document.body.appendChild(modal);
      }
  
      // если модалка пустая — заполняем шаблон
      if (!modal.firstElementChild) {
        modal.innerHTML = `
          <form id="editUserForm" class="card" style="min-width:320px">
            <h3 style="margin-top:0">Редактировать пользователя</h3>
            <input type="hidden" id="editUserId" />
            <label>Имя пользователя
              <input id="editUsername" type="text" required />
            </label>
            <label>Новый пароль (необязательно)
              <input id="editPassword" type="password" placeholder="Оставь пустым — без изменения" />
            </label>
            <label>Роли
              <select id="editRoles" multiple>
                <option value="Администратор">Администратор</option>
                <option value="Редактор">Редактор</option>
                <option value="Пользователь">Пользователь</option>
                <option value="Гость">Гость</option>
              </select>
            </label>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px">
              <button type="button" id="editCancelBtn" class="button-secondary">Отмена</button>
              <button type="submit">Сохранить</button>
            </div>
          </form>
        `;
      }
  
      // стилизованная подложка у тебя уже описана в base.css (#editUserModal) — использовать её
      // (если хочешь скрывать по клику вне формы, раскомментируй)
      on(modal, 'click', (e) => {
        if (e.target === modal) closeEditUserModal();
      });
  
      const form = $('#editUserForm', modal);
      const cancelBtn = $('#editCancelBtn', modal);
      on(cancelBtn, 'click', closeEditUserModal);
  
      // submit (вешаем разово; повторная инициализация не создаст дубликат — браузер сам заменит слушатель)
      form.onsubmit = async (ev) => {
        ev.preventDefault();
        if (!ipc) return toast('IPC недоступен.');
  
        const userId   = $('#editUserId').value;
        const username = $('#editUsername').value.trim();
        const password = $('#editPassword').value;
        const rolesSel = $('#editRoles');
        const roles    = Array.from(rolesSel.selectedOptions).map(o => o.value);
  
        try {
          await ipc.invoke('edit-user', { userId, username, password, roles });
          closeEditUserModal();
          await loadUsers();
          toast('Пользователь обновлён.');
        } catch (err) {
          console.error('[admin] edit-user error:', err);
          toast('Ошибка при редактировании пользователя.');
        }
      };
  
      return modal;
    }
  
    function openEditUserModal(user) {
      const modal = ensureEditModal();
  
      $('#editUserId', modal).value = user.id;
      $('#editUsername', modal).value = user.username;
      $('#editPassword', modal).value = '';
  
      const rolesSel = $('#editRoles', modal);
      Array.from(rolesSel.options).forEach(opt => {
        opt.selected = (user.Roles || []).some(r => r.name === opt.value);
      });
  
      // показать
      show(modal, true);
    }
  
    function closeEditUserModal() {
      show($('#editUserModal'), false);
    }
  
    // ---------- Таб «Пользователи» ----------
    async function loadUsers() {
      if (!ipc) return;
      try {
        const users = await ipc.invoke('get-users-with-roles');
        const tbody = $('#userTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
  
        (users || []).forEach(user => {
          const tr = document.createElement('tr');
  
          const tdId = document.createElement('td'); tdId.textContent = user.id; tr.appendChild(tdId);
          const tdU  = document.createElement('td'); tdU.textContent  = user.username; tr.appendChild(tdU);
          const tdR  = document.createElement('td'); tdR.textContent  = (user.Roles||[]).map(r => r.name).join(', '); tr.appendChild(tdR);
  
          const tdActions = document.createElement('td');
  
          const btnEdit = document.createElement('button');
          btnEdit.textContent = 'Редактировать';
          on(btnEdit, 'click', () => openEditUserModal(user));
          tdActions.appendChild(btnEdit);
  
          const btnDel = document.createElement('button');
          btnDel.textContent = 'Удалить';
          btnDel.className = 'button-secondary';
          on(btnDel, 'click', () => deleteUser(user.id));
          tdActions.appendChild(btnDel);
  
          tr.appendChild(tdActions);
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error('[admin] loadUsers error:', err);
      }
    }
  
    async function deleteUser(userId) {
      if (!ipc) return;
      if (!confirm('Удалить этого пользователя?')) return;
      try {
        const res = await ipc.invoke('delete-user', userId);
        if (res?.success) {
          await loadUsers();
          toast('Пользователь удалён.');
        } else {
          toast(`Ошибка удаления: ${res?.message || 'неизвестно'}`);
        }
      } catch (err) {
        console.error('[admin] delete-user error:', err);
        toast('Ошибка при удалении пользователя.');
      }
    }
  
    function wireAddUserForm() {
      const form = $('#addUserForm');
      if (!form) return;
      form.onsubmit = async (ev) => {
        ev.preventDefault();
        if (!ipc) return toast('IPC недоступен.');
  
        const username = $('#username').value.trim();
        const password = $('#password').value;
        const roles    = Array.from($('#roles').selectedOptions).map(o => o.value);
  
        if (!username || !password) return toast('Укажи имя и пароль.');
  
        try {
          const res = await ipc.invoke('add-user', { username, password, roles });
          if (res?.success) {
            form.reset();
            await loadUsers();
            toast('Пользователь добавлен.');
          } else {
            toast(`Ошибка добавления: ${res?.message || 'неизвестно'}`);
          }
        } catch (err) {
          console.error('[admin] add-user error:', err);
          toast('Ошибка при добавлении пользователя.');
        }
      };
    }
  
    // ---------- Таб «Журнал пользователей» ----------
    async function loadUserLogs() {
      if (!ipc) return;
      try {
        const logs = await ipc.invoke('get-user-logs');
        const tbody = $('#userLogsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
  
        (logs || []).forEach(log => {
          const tr = document.createElement('tr');
  
          const tdId  = document.createElement('td'); tdId.textContent = log.Id; tr.appendChild(tdId);
          const tdU   = document.createElement('td'); tdU.textContent  = log.username; tr.appendChild(tdU);
          const tdIn  = document.createElement('td'); tdIn.textContent = log.login_time  ? new Date(log.login_time).toLocaleString()  : ''; tr.appendChild(tdIn);
          const tdOut = document.createElement('td'); tdOut.textContent = log.logout_time ? new Date(log.logout_time).toLocaleString() : 'Не завершено'; tr.appendChild(tdOut);
  
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error('[admin] loadUserLogs error:', err);
      }
    }
  
    // ---------- CSV импорт и сброс БД ----------
    function wireCsvUpload() {
      const btn = $('#uploadButton');
      const fileInput = $('#fileInput');
      on(btn, 'click', async () => {
        if (!ipc) return toast('IPC недоступен.');
        const file = fileInput?.files?.[0];
        if (!file) return toast('Пожалуйста, выбери CSV-файл.');
        try {
          const res = await ipc.invoke('import-vessel-data', file.path);
          if (res?.success) toast('Импорт данных завершён.');
          else toast(`Ошибка импорта: ${res?.error || 'неизвестно'}`);
        } catch (err) {
          console.error('[admin] import-vessel-data error:', err);
          toast('Ошибка связи с основным процессом.');
        }
      });
    }
  
    function wireClearDB() {
      const btn = $('#ClearDBButton');
      const status = $('#statusMessage');
      on(btn, 'click', async () => {
        if (!ipc) return toast('IPC недоступен.');
        if (!confirm('Вы уверены, что хотите полностью очистить базу данных?')) return;
        try {
          const res = await ipc.invoke('clear-database');
          if (res?.success) {
            status.textContent = 'База данных успешно очищена';
            status.style.color = 'green';
            await loadUsers();
          } else {
            status.textContent = `Ошибка: ${res?.message || 'неизвестно'}`;
            status.style.color = 'red';
          }
        } catch (err) {
          console.error('[admin] clear-database error:', err);
          status.textContent = 'Произошла ошибка при очистке базы данных';
          status.style.color = 'red';
        }
      });
    }
  
    // ---------- Табы ----------
    function wireTabs() {
      const tabs = $$('.tab');
      const panes = $$('.tab-content');
      tabs.forEach(tab => {
        on(tab, 'click', () => {
          const target = tab.getAttribute('data-tab');
          tabs.forEach(t => t.classList.toggle('active', t === tab));
          panes.forEach(p => p.classList.toggle('active', p.id === target));
          if (target === 'userLogs') loadUserLogs();
        });
      });
    }
  
    // ---------- Инициализация после лэйаута ----------
    function initAdminUI() {
      // всё, что зависит от DOM, вешаем ТОЛЬКО после layout:ready
      wireTabs();
      wireAddUserForm();
      wireCsvUpload();
      wireClearDB();
  
      // создаём модалку один раз
      ensureEditModal();
  
      // первичная загрузка
      loadUsers();
  
      // esc закрывает модалку
      on(document, 'keydown', (e) => {
        if (e.key === 'Escape') closeEditUserModal();
      });
    }
  
    // Baselayout перерисовывает <body> и потом кидает layout:ready → ждём его
    document.addEventListener('layout:ready', initAdminUI);
    // если скрипт подключили после того, как лэйаут уже сработал
    if (window.__layoutLoaded) initAdminUI();
  
  })();
  