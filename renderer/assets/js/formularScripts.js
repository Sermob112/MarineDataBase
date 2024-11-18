const { ipcRenderer } = require('electron');



// Функция для отображения текущего статуса записи

async function loadShipDetails() {
  try {
    // Получаем данные судна из main процесса
    const ship = await ipcRenderer.invoke('get-selected-ship');

    const tbody = document.querySelector('#shipTable tbody');
    tbody.innerHTML = ''; // Очистить таблицу

    // Заполняем таблицу деталями судна
    Object.entries(ship).forEach(([key, value]) => {
      const row = document.createElement('tr');

      const fieldCell = document.createElement('td');
      fieldCell.textContent = key;

      const valueCell = document.createElement('td');
      valueCell.textContent = value;

      row.appendChild(fieldCell);
      row.appendChild(valueCell);
      tbody.appendChild(row);
    });

    // Обновляем статус записи
    const recordStatus = document.getElementById('recordStatus');
    recordStatus.textContent = `Запись ID: ${ship.id} из `;
  } catch (error) {
    console.error('Ошибка при загрузке деталей судна:', error);
  }
}

// Загружаем детали при открытии страницы
loadShipDetails();
