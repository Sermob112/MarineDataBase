// assets/js/analizScripts.js — переписано целиком
(function(){
  // ---------- IPC (Electron) ----------
  function resolveIPC() {
    if (window.electron?.ipcRenderer) return window.electron.ipcRenderer;
    try { return require('electron').ipcRenderer; } catch { /* no-op */ }
    console.warn('[analiz] ipcRenderer недоступен. Проверь preload/настройки контекста.');
    return null;
  }
  const ipc = resolveIPC();

  // ---------- Переводы полей (оригинал) ----------
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
  // В исходнике были дубли (по ключам и по значениям). Ниже мы их аккуратно устраним при генерации опций. :contentReference[oaicite:1]{index=1}

  // ---------- Утилиты ----------
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  function on(el, ev, cb, opts){ el && el.addEventListener(ev, cb, opts); }
  function toast(msg){ alert(msg); } // замени на свою систему уведомлений, если есть

  function getReadableHeader(key) {
    for (const [readableName, fieldName] of Object.entries(fieldTranslations)) {
      if (fieldName === key) return readableName;
    }
    return key;
  }

  // ---------- Рендер сводной таблицы ----------
  function renderPivotTable(data) {
    const table = $('#pivotTable');
    if (!table) { console.warn('[analiz] #pivotTable не найден'); return; }

    table.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      table.textContent = 'Нет данных для отображения';
      return;
    }

    const headerRow = document.createElement('tr');
    const headers = Object.keys(data[0]);

    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = getReadableHeader(header);
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach((row) => {
      const tr = document.createElement('tr');
      headers.forEach((header) => {
        const td = document.createElement('td');
        td.textContent = row[header];
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  }

  function handleResponse(jsonData) {
    if (jsonData && Array.isArray(jsonData)) {
      console.log('[analiz] pivot data:', jsonData.length, 'rows');
      renderPivotTable(jsonData);
    } else {
      console.error('[analiz] Ошибка при получении данных сводной таблицы');
      toast('Ошибка при получении данных сводной таблицы');
    }
  }

  // ---------- Инициализация UI ----------
  function initAnalizUI(){
    // элементы
    const fieldSelector1 = $('#fieldSelector1');
    const fieldSelector2 = $('#fieldSelector2');
    const analyzeButton  = $('#analyzeButton');

    // могут отсутствовать, если это не та страница — выходим тихо
    if (!fieldSelector1 || !fieldSelector2 || !analyzeButton) {
      console.warn('[analiz] Не найдены элементы анализа (селект/кнопка). Пропускаю инициализацию.');
      return;
    }

    // наполняем селекты уникальными полями (устраняя дубли по значению)
    const unique = new Map(); // fieldName -> readableName (первый встретившийся)
    for (const [readable, field] of Object.entries(fieldTranslations)) {
      if (!unique.has(field)) unique.set(field, readable);
    }

    // очистим на случай повторной инициализации
    fieldSelector1.innerHTML = '';
    fieldSelector2.innerHTML = '';

    // options для первого селекта
    for (const [field, readable] of unique.entries()) {
      const opt = document.createElement('option');
      opt.value = field;
      opt.textContent = readable;
      fieldSelector1.appendChild(opt);
    }

    // пустая опция для второго + остальные
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- Не выбрано --';
    fieldSelector2.appendChild(emptyOption);

    for (const [field, readable] of unique.entries()) {
      const opt = document.createElement('option');
      opt.value = field;
      opt.textContent = readable;
      fieldSelector2.appendChild(opt);
    }

    // восстановим предыдущий выбор (если сохранялся)
    try {
      const s1 = localStorage.getItem('analiz.field1');
      const s2 = localStorage.getItem('analiz.field2');
      if (s1) fieldSelector1.value = s1;
      if (s2 !== null) fieldSelector2.value = s2; // '' допустимо
    } catch {}

    // обработчик кнопки анализа
    on(analyzeButton, 'click', async () => {
      const selectedField1 = fieldSelector1.value;
      const selectedField2 = fieldSelector2.value;

      if (!selectedField1) {
        toast('Выбери хотя бы один параметр для анализа.');
        return;
      }

      // сохраним выбор
      try {
        localStorage.setItem('analiz.field1', selectedField1);
        localStorage.setItem('analiz.field2', selectedField2 ?? '');
      } catch {}

      if (!ipc) { toast('IPC недоступен.'); return; }

      try {
        if (selectedField1 && !selectedField2) {
          const jsonData = await ipc.invoke('createPivotTable', selectedField1);
          handleResponse(jsonData);
        } else {
          const jsonData = await ipc.invoke('createPivotTableTwoFields', selectedField1, selectedField2);
          handleResponse(jsonData);
        }
      } catch (error) {
        console.error('[analiz] Ошибка при запросе данных:', error);
        toast('Ошибка при запросе данных.');
      }
    });

    // сайдбар (переключатель)
    const toggleButton   = $('#toggleButton');
    const sidebar        = $('#sidebar');
    const tableContainer = $('.table-container');

    on(toggleButton, 'click', () => {
      if (!sidebar || !tableContainer) return;

      // Читаем ТЕКУЩЕЕ значение из вычисленных стилей, а не из inline
      const rightNow = getComputedStyle(sidebar).right.trim();

      if (rightNow === '0px') {
        sidebar.style.right = '-50%';
        tableContainer.style.marginRight = '0';
      } else {
        sidebar.style.right = '0px';
        tableContainer.style.marginRight = '50%';
      }
    });
  }

  // ---------- Точка входа ----------
  // Baselayout заменяет body на DOMContentLoaded и затем диспатчит layout:ready → ждём его
  document.addEventListener('layout:ready', initAnalizUI);
  // если скрипт подключили уже после вставки лэйаута
  if (window.__layoutLoaded) initAnalizUI();
  // fallback: если Baselayout не используется на этой странице
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.__layoutLoaded) initAnalizUI();
  });
})();
