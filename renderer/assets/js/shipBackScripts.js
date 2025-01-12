const { ipcRenderer } = require('electron');

let offset = 0; // Начальное смещение
const batchSize = 50; // Количество записей за раз
let loading = false; // Флаг для предотвращения одновременных загрузок
let hasMoreData = true; // Флаг, есть ли еще данные для загрузки

async function loadShipData() {
  if (loading || !hasMoreData) return; // Если идет загрузка или больше нет данных, не продолжаем

  loading = true;

  try {

    const ships = await ipcRenderer.invoke('get-ship-data', { offset, batchSize });

    if (ships.length < batchSize) {
      hasMoreData = false; 
    }

    const tbody = document.querySelector('#ship-table tbody');

    ships.forEach(ship => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = ship.id;

      const nameCell = document.createElement('td');
      nameCell.textContent = ship.main_type;

      const imoCell = document.createElement('td');
      imoCell.textContent = ship.imo_number;

      const registryCell = document.createElement('td');
      registryCell.textContent = ship.reg_number;

      const factoryCell = document.createElement('td');
      factoryCell.textContent = ship.refit_factory;

      const projectCell = document.createElement('td');
      projectCell.textContent = ship.vessel_project;

      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(imoCell);
      row.appendChild(registryCell);
      row.appendChild(factoryCell);
      row.appendChild(projectCell);

      row.addEventListener('click', () => {
        viewDetails(ship.id);
      });

      tbody.appendChild(row);
    });

    offset += batchSize; // Увеличиваем смещение для следующей партии
  } catch (error) {
    console.error('Ошибка при загрузке данных судов:', error);
  } finally {
    loading = false;
  }
}


const tableContainer = document.querySelector('#table-container');
tableContainer.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = tableContainer;


  if (scrollTop + clientHeight >= scrollHeight - 10) {
    loadShipData();
  }
});

loadShipData();


document.getElementById('search-input').addEventListener('input', async event => {
  const query = event.target.value;

  try {
    // Выполняем поиск через IPC
    const { totalRecords, filteredCount, ships } = await ipcRenderer.invoke('search-ship', query);

    // Обновляем таблицу
    const tbody = document.querySelector('#ship-table tbody');
    tbody.innerHTML = ''; // Очищаем таблицу

    ships.forEach(ship => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = ship.id;

      const nameCell = document.createElement('td');
      nameCell.textContent = ship.main_type;

      const imoCell = document.createElement('td');
      imoCell.textContent = ship.imo_number;

      const registryCell = document.createElement('td');
      registryCell.textContent = ship.reg_number;

      const factoryCell = document.createElement('td');
      factoryCell.textContent = ship.refit_factory;

      const projectCell = document.createElement('td');
      projectCell.textContent = ship.vessel_project;

      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(imoCell);
      row.appendChild(registryCell);
      row.appendChild(factoryCell);
      row.appendChild(projectCell);

      row.addEventListener('click', () => {
        viewDetails(ship.id);
      });

      tbody.appendChild(row);
    });

    // Обновляем информацию о результатах
    const resultInfo = document.getElementById('result-info');
    resultInfo.textContent = `Найдено ${filteredCount} из ${totalRecords} записей.`;
  } catch (error) {
    console.error('Ошибка при поиске судов:', error);
  }
});




function viewDetails(shipId) {
  // Передаем ID судна через IPC и перенаправляем на другую страницу
  ipcRenderer.invoke('load-ship-details', shipId).then(() => {
    window.location.href = 'shipFormular.html'; // Переход на страницу подробностей
  }).catch(error => {
    console.error('Ошибка при загрузке деталей судна:', error);
  });
}





document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('ship-table');
  const headers = table.querySelectorAll('th');
  let sortField = 'id'; // Начальное поле сортировки
  let ascending = true; // Направление сортировки
  let currentOffset = 0; // Начальный offset для пагинации
  const batchSize = 50; // Размер страницы

  headers.forEach(header => {
    header.addEventListener('click', async () => {
      // Получаем название поля из data-field
      const field = header.getAttribute('data-field');

      // Если кликнули на тот же заголовок, меняем направление сортировки
      if (field === sortField) {
        ascending = !ascending;
      } else {
        // Если кликнули на новый заголовок, то сортируем по новому полю
        sortField = field;
        ascending = true; // По умолчанию сортировка по возрастанию
        currentOffset = 0; // При смене сортировки начинаем с первой страницы
      }

      // Отправляем запрос на сервер с выбранным полем сортировки и текущим offset
      const ships = await ipcRenderer.invoke('get-ship-data', { offset: currentOffset, batchSize, sortField, ascending });

      // Обновляем таблицу с новыми данными
      updateTable(ships);

      // Обновляем стрелки в заголовках
      updateHeaderArrows();
    });
  });

  function updateTable(ships) {
    const tbody = document.querySelector('#ship-table tbody');
    tbody.innerHTML = ''; // Очищаем текущие строки таблицы

    ships.forEach(ship => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = ship.id;

      const nameCell = document.createElement('td');
      nameCell.textContent = ship.main_type;

      const imoCell = document.createElement('td');
      imoCell.textContent = ship.imo_number;

      const registryCell = document.createElement('td');
      registryCell.textContent = ship.reg_number;

      const factoryCell = document.createElement('td');
      factoryCell.textContent = ship.refit_factory;

      const projectCell = document.createElement('td');
      projectCell.textContent = ship.vessel_project;

      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(imoCell);
      row.appendChild(registryCell);
      row.appendChild(factoryCell);
      row.appendChild(projectCell);

      row.addEventListener('click', () => {
        viewDetails(ship.id);
      });

      tbody.appendChild(row);
    });
  }

  function updateHeaderArrows() {
    headers.forEach(header => {
      header.innerHTML = header.innerHTML.replace(/[▲▼]/g, '').trim(); // Убираем старые стрелки
    });

    // Добавляем стрелку на заголовок, по которому производится сортировка
    const sortedHeader = Array.from(headers).find(header => header.getAttribute('data-field') === sortField);
    const arrow = ascending ? ' ▲' : ' ▼';
    sortedHeader.innerHTML += arrow;
  }})