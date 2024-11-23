
const { ipcRenderer } = require("electron");

async function fetchPivotTableData() {
  try {
    // Отправляем запрос на создание сводной таблицы через IPC
    const jsonData = await ipcRenderer.invoke("createPivotTable");

    // Проверяем, что данные получены
    if (jsonData && Array.isArray(jsonData)) {
      console.log("Pivot table data received:", jsonData);
      renderPivotTable(jsonData);
    } else {
      console.error("Ошибка при получении данных сводной таблицы");
    }
  } catch (error) {
    console.error("Ошибка при запросе данных:", error);
  }
}

// Функция для рендеринга таблицы на странице
function renderPivotTable(data) {
  const table = document.getElementById("pivotTable");
  table.innerHTML = ""; // Очищаем таблицу перед рендерингом

  // Создаем заголовки таблицы
  const headerRow = document.createElement("tr");
  const headers = Object.keys(data[0]); // Получаем имена колонок
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Создаем строки таблицы для данных
  data.forEach((row) => {
    const tr = document.createElement("tr");
    headers.forEach((header) => {
      const td = document.createElement("td");
      td.textContent = row[header];
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}

// Вызываем функцию для получения данных при загрузке страницы
document.addEventListener("DOMContentLoaded", fetchPivotTableData);
