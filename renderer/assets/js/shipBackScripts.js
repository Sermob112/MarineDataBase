const { ipcRenderer } = require('electron');

let offset = 0; // Начальное смещение
const batchSize = 50; // Количество записей за раз
let loading = false; // Флаг для предотвращения одновременных загрузок
let hasMoreData = true; // Флаг, есть ли еще данные для загрузки

async function loadShipData() {
  if (loading || !hasMoreData) return; // Если идет загрузка или больше нет данных, не продолжаем

  loading = true;

  try {
    // Запрашиваем следующую партию данных
    const ships = await ipcRenderer.invoke('get-ship-data', { offset, batchSize });

    if (ships.length < batchSize) {
      hasMoreData = false; // Если записей меньше, чем batchSize, данных больше нет
    }

    const tbody = document.querySelector('#ship-table tbody');

    ships.forEach(ship => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = ship.id;

      const nameCell = document.createElement('td');
      nameCell.textContent = ship.vessel_name;

      const imoCell = document.createElement('td');
      imoCell.textContent = ship.imo_number;

      const registryCell = document.createElement('td');
      registryCell.textContent = ship.reg_number;

      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(imoCell);
      row.appendChild(registryCell);
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

// Обработчик события прокрутки
const tableContainer = document.querySelector('#table-container');
tableContainer.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = tableContainer;

  // Если прокрутка почти достигла низа контейнера, загружаем данные
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    loadShipData();
  }
});

// Инициализация начальной загрузки
loadShipData();

// Поиск обновляет таблицу и сбрасывает ленивую загрузку
document.getElementById('search-input').addEventListener('input', async event => {
  const query = event.target.value;

  try {
    const ships = await ipcRenderer.invoke('search-ship', query);
    const tbody = document.querySelector('#ship-table tbody');
    tbody.innerHTML = ''; // Очищаем таблицу

    ships.forEach(ship => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = ship.id;

      const nameCell = document.createElement('td');
      nameCell.textContent = ship.vessel_name;

      const imoCell = document.createElement('td');
      imoCell.textContent = ship.imo_number;

      const registryCell = document.createElement('td');
      registryCell.textContent = ship.reg_number;

      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(imoCell);
      row.appendChild(registryCell);
      row.addEventListener('click', () => {
        viewDetails(ship.id);
      });

      tbody.appendChild(row);
    });

    // Сброс значений для ленивой загрузки
    offset = 0;
    hasMoreData = true;
  } catch (error) {
    console.error('Ошибка при поиске судов:', error);
  }
});


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
function viewDetails(shipId) {
  // Передаем ID судна через IPC и перенаправляем на другую страницу
  ipcRenderer.invoke('load-ship-details', shipId).then(() => {
    window.location.href = 'shipFormular.html'; // Переход на страницу подробностей
  }).catch(error => {
    console.error('Ошибка при загрузке деталей судна:', error);
  });
}
// Загружаем данные при инициализации
