
const { ipcRenderer } = require("electron");

const fieldTranslations  = {
  'Название судна': 'vessel_name',
  'Регистровый номер': 'reg_number',
  'Номер ИМО': 'imo_number',
  'Бывшее название': 'former_name',
  'Позывной': 'callsign',
  'Порт приписки': 'port_of_registry',
  'Флаг': 'flag',
  'Символ класса': 'class_symbol',
  'Переоборудование/модернизация существенного характера': 'major_conversion',
  'Основной тип': 'main_type',
  'Дата постройки': 'build_date',
  'Страна постройки': 'build_country',
  'Строительный номер': 'build_number',
  'Дата значительной части': 'major_part_date',
  'Значительная часть': 'major_part',
  'Валовая вместимость': 'gross_tonnage',
  'Чистая вместимость': 'net_tonnage',
  'Дедвейт': 'deadweight',
  'Водоизмещение': 'displacement',
  'Длина наибольшая (теоретическая)': 'max_length',
  'Длина габаритная': 'overall_length',
  'Длина расчетная': 'calc_length',
  'Ширина габаритная': 'overall_width',
  'Высота борта': 'side_height',
  'Осадка': 'draft',
  'Скорость': 'speed',
  'Тип силовой установки': 'propulsion_type',
  'Главные двигатели': 'main_engines',
  'Количество лопастей': 'propeller_count',
  'Общая мощность генераторов': 'total_generator_power',
  'Главные котлы': 'main_boilers',
  'Холодильная установка': 'refrigeration_system',
  'Рабочая температура': 'working_temperature',
  'Хладагенты': 'refrigerants',
  'Радио-навигационное оборудование': 'radio_navigation_equipment',
  'Охлаждаемые грузовые помещения': 'refrigerated_cargo_space',
  'Наливные танки': 'tanks',
  'Количество палуб': 'deck_count',
  'Количество переборок': 'transverse_bulkheads_count',
  'Число пассажиров коечные': 'bed_passenger_count',
  'Число пассажиров бескоечных': 'non_bed_passenger_count',
  'Спецперсонал': 'special_personnel',
  'Грузовые люки (число и размер в свету)': 'cargo_hatches',
  'Стрелы': 'booms',
  'Краны': 'cranes',
  'Запасы топлива': 'fuel_reserves',
  'Типы топлива': 'fuel_types',
  'Водяной балласт': 'ballast',
  'Подогреватели': 'heaters',
  'Характеристика снабжения': 'supply_characteristics',
  'Категория якорных цепей': 'anchor_chain_category',
  'Калибр якорных цепей': 'anchor_chain_caliber',
  'Проект судна': 'vessel_project',
  'Дата постройки (первое освидетельствование)': 'first_inspection_date',
  'Место постройки': 'build_location',
  'Длина конструктивная': 'design_length',
  'Ширина конструктивная': 'design_width',
  'Высота надводного борта': 'freeboard_height',
  'Грузоподъемность': 'lifting_capacity',
  'Количество поперечных переборок': 'transverse_bulkheads_count',
  'Количество продольных переборок': 'longitudinal_bulkheads_count',
  'Пассажировместимость': 'passenger_capacity',
  'Экипаж': 'crew_size',
  'Орг. группа': 'org_group',
  'Количество наливных танков': 'total_tank_volume',
  'Суммарный объем наливных танков': 'total_tank_volume',
  'Грузоподъемность первой стрелы': 'boom_1_capacity',
  'Грузоподъемность второй стрелы': 'boom_2_capacity',
  'Грузоподъемность третьей стрелы': 'boom_3_capacity',
  'Материал корпуса': 'hull_material',
  'Материал надстройки': 'superstructure_material',
  'Марка главной силовой установки': 'propulsion_model',
  'ГЭД, всего': 'total_electric_generators',
  'ГЭД, кВт всех': 'total_generator_power',
  'ГЭС, кВт всех': 'total_ged_power',
  'Завод постройки': 'factory_location',
  'Город постройки': 'build_city',
  'Завод достройки': 'refit_factory',
  'Город достройки': 'refit_city',
  'Заложено': 'laid_down_date',
  'Спущено на воду': 'launch_date',
  'Построено': 'completion_date',
  'Владелец': 'owner',
  'Оператор': 'operator',
  'Регистрация': 'registration',
  'Бортовой номер': 'board_number',
  'MMSI': 'mmsi',
  'Текущее состояние': 'current_status',
  'Примечания': 'notes',
  'Количество движителей': 'propulsion_count',
  'Тип движителей': 'propulsion_type',
  'Количество ГЭД': 'ged_count',
  'Общая мощность ГЭД': 'total_ged_power',
  'Количество грузовых трюмов': 'cargo_hold_count',
  'Кубатура грузовых трюмов': 'cargo_hold_volume',
  'Количество контейнеров': 'container_count',
  'Тип контейнеров': 'container_type',
  'Источник': 'source'
};


document.addEventListener("DOMContentLoaded", () => {
  const fieldSelector1 = document.getElementById("fieldSelector1");
  const fieldSelector2 = document.getElementById("fieldSelector2");
  const analyzeButton = document.getElementById("analyzeButton");

  // Заполнение выпадающих списков
  Object.keys(fieldTranslations).forEach((key) => {
    const option1 = document.createElement("option");
    option1.value = fieldTranslations[key];
    option1.textContent = key;
    fieldSelector1.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = fieldTranslations[key];
    option2.textContent = key;
    fieldSelector2.appendChild(option2);
  });

  // Добавляем пустую опцию во второй выпадающий список
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "-- Не выбрано --";
  fieldSelector2.insertBefore(emptyOption, fieldSelector2.firstChild);

  // Обработчик кнопки
  analyzeButton.addEventListener("click", async () => {
    const selectedField1 = fieldSelector1.value;
    const selectedField2 = fieldSelector2.value;

    try {
      if (selectedField1 && !selectedField2) {
        // Анализ только по одному параметру
        const jsonData = await ipcRenderer.invoke("createPivotTable", selectedField1);
        handleResponse(jsonData);
      } else if (selectedField1 && selectedField2) {
        // Анализ по двум параметрам
        const jsonData = await ipcRenderer.invoke("createPivotTableTwoFields", selectedField1, selectedField2);
        handleResponse(jsonData);
      } else {
        console.error("Необходимо выбрать хотя бы один параметр для анализа.");
      }
    } catch (error) {
      console.error("Ошибка при запросе данных:", error);
    }
  });
});

// Функция для обработки данных и их рендера
function handleResponse(jsonData) {
  if (jsonData && Array.isArray(jsonData)) {
    console.log("Pivot table data received:", jsonData);
    renderPivotTable(jsonData);
  } else {
    console.error("Ошибка при получении данных сводной таблицы");
  }
}

function getReadableHeader(key) {
  for (const [readableName, fieldName] of Object.entries(fieldTranslations)) {
    if (fieldName === key) {
      return readableName;
    }
  }
  return key; // Если ключ не найден, возвращаем исходное значение
}
// Функция рендера таблицы
function renderPivotTable(data) {
  const table = document.getElementById("pivotTable");
  table.innerHTML = "";

  if (data.length === 0) {
    table.textContent = "Нет данных для отображения";
    return;
  }

  // Заголовок таблицы
  const headerRow = document.createElement("tr");
  const headers = Object.keys(data[0]);
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = getReadableHeader(header);
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Строки таблицы
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

document.getElementById('toggleButton').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  const tableContainer = document.querySelector('.table-container');

  if (sidebar.style.right === '0px') {
      sidebar.style.right = '-50%';
      tableContainer.style.marginRight = '0';
  } else {
      sidebar.style.right = '0px';
      tableContainer.style.marginRight = '50%';
  }
});