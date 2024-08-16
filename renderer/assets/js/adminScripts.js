const { ipcRenderer } = require('electron');
// Функция загрузки журнала пользователей
async function loadUserLogs() {
    try {
        const logs = await ipcRenderer.invoke('get-user-logs');
        const tableBody = document.getElementById('userLogsTableBody');

        // Очищаем таблицу перед добавлением новых данных
        tableBody.innerHTML = '';

        logs.forEach(log => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = log.Id;
            row.appendChild(idCell);

            const usernameCell = document.createElement('td');
            usernameCell.textContent = log.username;
            row.appendChild(usernameCell);

            const loginTimeCell = document.createElement('td');
            loginTimeCell.textContent = new Date(log.login_time).toLocaleString();
            row.appendChild(loginTimeCell);

            const logoutTimeCell = document.createElement('td');
            logoutTimeCell.textContent = log.logout_time ? new Date(log.logout_time).toLocaleString() : 'Не завершено';
            row.appendChild(logoutTimeCell);

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при загрузке журнала пользователей:', error);
    }
}

// Добавляем вызов загрузки журнала при переключении на вкладку
document.querySelector('[data-tab="userLogs"]').addEventListener('click', loadUserLogs);
async function loadUsers() {
    try {
        const users = await ipcRenderer.invoke('get-users-with-roles');
        const tableBody = document.getElementById('userTableBody');

        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = user.id;
            row.appendChild(idCell);

            const usernameCell = document.createElement('td');
            usernameCell.textContent = user.username;
            row.appendChild(usernameCell);

            const rolesCell = document.createElement('td');
            rolesCell.textContent = user.Roles.map(role => role.name).join(', ');
            row.appendChild(rolesCell);

            // Кнопка редактирования
            const editButton = document.createElement('button');
            editButton.textContent = 'Редактировать';
            editButton.addEventListener('click', () => openEditUserModal(user));
            row.appendChild(editButton);

            // Кнопка удаления
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.addEventListener('click', () => deleteUser(user.id));
            row.appendChild(deleteButton);

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
    }
}

function openEditUserModal(user) {
    // Заполняем форму текущими данными пользователя
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;

    // Очищаем выбранные роли
    const rolesSelect = document.getElementById('editRoles');
    Array.from(rolesSelect.options).forEach(option => {
        option.selected = user.Roles.some(role => role.name === option.value);
    });

    // Открываем модальное окно
    document.getElementById('editUserModal').style.display = 'block';
}

function closeEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
}

document.getElementById('editUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const username = document.getElementById('editUsername').value;
    const password = document.getElementById('editPassword').value;
    const selectedRoles = Array.from(document.getElementById('editRoles').selectedOptions).map(option => option.value);

    try {
        await ipcRenderer.invoke('edit-user', { userId, username, password, roles: selectedRoles });
        closeEditUserModal();
        loadUsers(); // Обновляем список пользователей после редактирования
    } catch (error) {
        console.error('Ошибка при редактировании пользователя:', error);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Убираем активный класс у всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            // Добавляем активный класс к текущей вкладке
            tab.classList.add('active');

            // Показываем контент соответствующей вкладки
            const target = tab.getAttribute('data-tab');
            tabContents.forEach(content => {
                if (content.id === target) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
});
loadUsers();
