const { ipcRenderer } = require('electron');

let offset = 0; // Начальное смещение для основной загрузки
const batchSize = 50; // Количество записей за раз
let loading = false; // Флаг для предотвращения одновременных загрузок
let hasMoreData = true; // Флаг, есть ли еще данные для загрузки
let sortField = 'id'; // Начальное поле сортировки
let ascending = true; // Направление сортировки
let searchQuery = ''; // Текущий поисковый запрос
let searchOffset = 0; // Смещение для поисковой загрузки
let searchHasMoreData = true; // Флаг для поиска

async function loadShipData(sortField, ascending, isSearch = false, customOffset = null) {
  // if (loading || (!isSearch && !hasMoreData) || (isSearch && !searchHasMoreData)) return;

  loading = true;
  const currentOffset = customOffset !== null ? customOffset : (isSearch ? searchOffset : offset);

  try {
    
    if (isSearch) {
      // Вызываем search-ship
      const response = await ipcRenderer.invoke('search-ship', {
        query: searchQuery,
        offset: currentOffset,
        batchSize,
        sortField,
        ascending
      });
      // Извлекаем массив ships
      ships = response.ships;

      // Если вернулось меньше batchSize, значит дальше подгружать нечего
      if (ships.length < batchSize) {
        searchHasMoreData = false;
      }
    } else {
      // Обычная загрузка
      ships = await ipcRenderer.invoke('get-ship-data', {
        offset: currentOffset,
        batchSize,
        sortField,
        ascending
      });

      if (ships.length < batchSize) {
        hasMoreData = false;
      }
    }

    appendShipsToTable(ships);

    // Увеличиваем offset
    if (isSearch) {
      searchOffset += batchSize;
    } else {
      offset += batchSize;
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных судов:', error);
  } finally {
    loading = false;
  }
}
function appendShipsToTable(ships) {
    const tbody = document.querySelector('#ship-table tbody');
    ships.forEach(ship => {
        const row = createShipRow(ship);
        tbody.appendChild(row);
    });
}

function createShipRow(ship) {
  const row = document.createElement('tr');

  const idCell = createCell(ship.id);
  const nameCell = createCell(ship.main_type);
  const imoCell = createCell(ship.imo_number);
  const registryCell = createCell(ship.reg_number);
  const factoryCell = createCell(ship.refit_factory);
  const projectCell = createCell(ship.vessel_project);

  row.appendChild(idCell);
  row.appendChild(nameCell);
  row.appendChild(imoCell);
  row.appendChild(registryCell);
  row.appendChild(factoryCell);
  row.appendChild(projectCell);

  row.addEventListener('click', () => viewDetails(ship.id));

  return row;
}

function createCell(content) {
  const cell = document.createElement('td');
  cell.textContent = content;
  return cell;
}

const tableContainer = document.querySelector('#table-container');
tableContainer.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = tableContainer;

  if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (searchQuery) {
        loadShipData(sortField, ascending, true);
      } else {
        loadShipData(sortField, ascending);
      }
  }
});

loadShipData(sortField, ascending);

document.getElementById('search-input').addEventListener('input', async event => {
  searchQuery = event.target.value;
  searchOffset = 0;
  ascending = true;
  
  const tbody = document.querySelector('#ship-table tbody');
  tbody.innerHTML = ''; // Очищаем таблицу
  
  if (searchQuery) {
    loadShipData(sortField, ascending, true, 0);
  try {
        const { totalRecords, filteredCount } = await ipcRenderer.invoke('search-ship', {
        query: searchQuery,
        offset: searchOffset,
        batchSize,
        sortField,
        ascending
        });
  
          document.getElementById('result-info').textContent = `Найдено ${filteredCount} из ${totalRecords} записей.`;
          
        } catch (error) {
          console.error('Ошибка при подсчете результатов поиска:', error);
        }
  
  } else {
      const resultInfo = document.getElementById('result-info');
      resultInfo.textContent = "";
      await  loadShipData(sortField, ascending, false);
  }
  });

function viewDetails(shipId) {
  ipcRenderer.invoke('load-ship-details', shipId).then(() => {
    window.location.href = 'shipFormular.html';
  }).catch(error => {
    console.error('Ошибка при загрузке деталей судна:', error);
  });
}

document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('ship-table');
    const headers = table.querySelectorAll('th');
  
    headers.forEach(header => {
      header.addEventListener('click', async () => {
        const field = header.getAttribute('data-field');
        if (field === sortField) {
          ascending = !ascending;
        } else {
          sortField = field;
          ascending = true;
          offset = 0;
        }
  
        const tbody = document.querySelector('#ship-table tbody');
        tbody.innerHTML = ''; // Очищаем таблицу
        
        if (searchQuery) {
            searchOffset = 0;
            searchHasMoreData = true;
            loadShipData(sortField, ascending, true, 0);
        } else {
            offset = 0;
            hasMoreData = true;
            loadShipData(sortField, ascending, false, 0);
        }
      
        updateHeaderArrows(headers, sortField, ascending);
      });
    });
  
    function updateHeaderArrows(headers, sortField, ascending) {
      headers.forEach(header => {
        header.innerHTML = header.innerHTML.replace(/[▲▼]/g, '').trim(); // Убираем старые стрелки
      });
  
      const sortedHeader = Array.from(headers).find(header => header.getAttribute('data-field') === sortField);
      if(sortedHeader){
        const arrow = ascending ? ' ▲' : ' ▼';
        sortedHeader.innerHTML += arrow;
      }
    }
  });