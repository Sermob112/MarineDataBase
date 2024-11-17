const { ipcRenderer } = require('electron');

async function loadShipData() {
  try {
    // Запрос данных о судах
    const ships = await ipcRenderer.invoke('get-ship-data');
    
    // Получаем ссылку на tbody
    const tbody = document.querySelector('#ship-table tbody');

    // Очищаем tbody перед добавлением новых данных
    tbody.innerHTML = '';

    // Добавляем данные о судах в таблицу
    ships.forEach(ship => {
      const row = document.createElement('tr');

      // Создаем ячейки для каждой колонки
      const idCell = document.createElement('td');
      idCell.textContent = ship.id; // Предполагаем, что у вас есть поле id

      const nameCell = document.createElement('td');
      nameCell.textContent = ship.vessel_name; // Предполагаем, что у вас есть поле vesselName

      const imoCell = document.createElement('td');
      imoCell.textContent = ship.imo_number; // Предполагаем, что у вас есть поле imoNumber

      const registryCell = document.createElement('td');
      registryCell.textContent = ship.reg_number; // Предполагаем, что у вас есть поле registry

      // Создаем ячейку для действий
      const actionsCell = document.createElement('td');
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.onclick = () => editShip(ship.id); // Функция редактирования
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = () => deleteShip(ship.id); // Функция удаления
      actionsCell.appendChild(deleteButton);

      // Добавляем ячейки в строку
      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(imoCell);
      row.appendChild(registryCell);
      row.appendChild(actionsCell);

      // Добавляем строку в tbody
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Ошибка при загрузке данных судов:', error);
  }
}

// Функция для редактирования судна
function editShip(shipId) {
  // Здесь вы можете добавить логику для редактирования судна
  console.log('Edit ship with ID:', shipId);
}

// Функция для удаления судна
async function deleteShip(shipId) {
  const confirmation = confirm('Вы уверены, что хотите удалить это судно?');
  if (confirmation) {
    try {
      const result = await ipcRenderer.invoke('delete-ship', shipId);
      if (result.success) {
        loadShipData(); // Перезагружаем данные после удаления
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Ошибка при удалении судна:', error);
    }
  }
}

// Загружаем данные при инициализации
loadShipData();