
const { ipcRenderer } = require('electron');

async function loadUsers() {
    try {
        const users = await ipcRenderer.invoke('get-users-with-roles');
        const tableBody = document.getElementById('userTableBody');
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

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
    }
}

loadUsers();
