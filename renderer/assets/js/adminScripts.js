const { ipcRenderer } = require('electron');

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

loadUsers();
