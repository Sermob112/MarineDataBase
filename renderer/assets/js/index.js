async function loadShipsLogs() {
    try {
        const tableBody = document.getElementById('shipsTableBody');
        // Очищаем таблицу перед добавлением новых данных
        tableBody.innerHTML = '';

        
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent = 2;
        row.appendChild(idCell);

        const usernameCell = document.createElement('td');
        usernameCell.textContent = 'Непобедимый';
        row.appendChild(usernameCell);

        const projectNameCell = document.createElement('td');
        projectNameCell.textContent = 'RH2091';
        row.appendChild(projectNameCell);

        const registerNumberCell = document.createElement('td');
        registerNumberCell.textContent = '371927367';
        row.appendChild(registerNumberCell);

        tableBody.appendChild(row);

    } catch (error) {
        console.error('Ошибка при загрузке списка судов:', error);
    }
}

loadShipsLogs();