// assets/js/formularScripts.js
const { ipcRenderer } = require('electron');

// Русский заголовок -> поле модели
const fieldTranslations  = {
  // ==== Идентификация / общие ====
  'Название судна': 'vessel_name',
  'Регистровый номер': 'reg_number',
  'Регис тровый номер': 'reg_number',                 // ALIAS (с пробелом)
  'Номер ИМО': 'imo_number',
  'IMO': 'imo_number',                                 // ALIAS
  'MMSI': 'mmsi',
  'Бывшее название': 'former_name',
  'Позывной': 'callsign',
  'Порт приписки': 'port_of_registry',
  'Флаг': 'flag',
  'Символ класса': 'class_symbol',
  'Переоборудование/модернизация существенного характера': 'major_conversion',
  'Основной тип': 'main_type',
  'Проект судна': 'vessel_project',
  'Назначение судна': 'vessel_purpose',               // NEW
  'Формула класса': 'class_formula',                  // NEW
  'Источник данных': 'data_source',                   // NEW
  'Источник': 'source',

  // ==== Постройка / места ====
  'Дата постройки': 'build_date',
  'Страна постройки': 'build_country',
  'Строительный номер': 'build_number',
  'Место постройки': 'build_location',
  'Завод постройки': 'factory_location',
  'Город постройки': 'build_city',
  'Завод достройки': 'refit_factory',
  'Город достройки': 'refit_city',

  // ==== Регистрация / статус ====
  'Учреждение регистрации': 'registration_authority', // NEW
  'Регистрация': 'registration',
  'Текущее состояние': 'current_status',
  'Владелец': 'owner',
  'Оператор': 'operator',
  'Бортовой номер': 'board_number',

  // ==== Даты строительства ====
  'Заложено': 'laid_down_date',
  'Дата закладки киля': 'keel_laying_date',          // NEW
  'Дата значительной части': 'major_part_date',
  'Значительная часть': 'major_part',
  'Дата постройки (первое освидетельствование)': 'first_inspection_date',
  'Спущено на воду': 'launch_date',
  'Построено': 'completion_date',

  // ==== Размерения / вместимости ====
  'Длина наибольшая (теоретическая)': 'max_length',
  'Длина наибольшая теоретическая': 'max_length',    // ALIAS
  'Длина габаритная': 'overall_length',
  'Длина расчетная': 'calc_length',
  'Длина конструктивная': 'design_length',
  'Ширина габаритная': 'overall_width',
  'Ширина конструктивная': 'design_width',
  'Высота борта': 'side_height',
  'Высота надводного борта': 'freeboard_height',
  'Надводный борт': 'freeboard_height',              // ALIAS (NEW ключ)
  'Осадка': 'draft',
  'Валовая вместимость': 'gross_tonnage',
  'Чистая вместимость': 'net_tonnage',
  'Дедвейт': 'deadweight',
  'Водоизмещение': 'displacement',
  'Грузоподъемность': 'lifting_capacity',
  'Кубатура грузовых трюмов': 'cargo_hold_volume',

  // ==== Пассажиры / экипаж ====
  'Экипаж': 'crew_size',
  'Численность экипажа': 'crew_size',                // ALIAS (NEW ключ)
  'Число пассажиров коечные': 'bed_passenger_count',
  'Число пассажиров бескоечных': 'non_bed_passenger_count',
  'Пассажировместимость': 'passenger_capacity',
  'Общее число пассажиров': 'passenger_capacity',    // ALIAS (NEW ключ)

  // ==== Грузовые / переборки / танки / контейнеры ====
  'Количество палуб': 'deck_count',
  'Количество переборок': 'transverse_bulkheads_count',
  'Количество переборок поперечных': 'transverse_bulkheads_count', // ALIAS (NEW ключ)
  'Количество продольных переборок': 'longitudinal_bulkheads_count',
  'Количество переборок продольных': 'longitudinal_bulkheads_count', // ALIAS (NEW ключ)
  'Общее количество переборок': 'bulkheads_total_count', // NEW

  'Количество грузовых трюмов': 'cargo_hold_count',
  'Грузовые люки (число и размер в свету)': 'cargo_hatches',
  'Стрелы': 'booms',
  'Краны': 'cranes',

  'Охлаждаемые грузовые помещения': 'refrigerated_cargo_space',
  'Количество охлаждаемых грузовых помещений': 'refrigerated_cargo_space_count', // NEW
  'Вместимость охлаждаемого грузового помещения': 'refrigerated_cargo_space_capacity', // NEW

  'Количество наливных танков': 'tanks_count',       // FIX (раньше было total_tank_volume)
  'Объём наливного танка': 'tank_volume',            // NEW
  'Суммарный объем наливных танков': 'total_tank_volume',

  'Количество контейнеров': 'container_count',
  'Тип контейнеров': 'container_type',

  // ==== Энергетика / пропульсивный комплекс ====
  'Тип силовой установки': 'propulsion_type',
  'Тип движителей': 'propulsion_type',
  'Тип движителя': 'propulsor_type',                // NEW (не путать с propulsion_type)
  'Главные двигатели': 'main_engines',
  'Марка главной силовой установки': 'propulsion_model',
  'Заводская модель главного двигателя': 'main_engine_model', // NEW
  'Количество лопастей': 'propeller_count',
  'Общая мощность генераторов': 'total_generator_power',
  'ГЭД, всего': 'total_electric_generators',
  'ГЭД, кВт всех': 'total_generator_power',
  'Количество движителей': 'propulsion_count',
  'Количество ГЭД': 'ged_count',
  'Общая мощность ГЭД': 'total_ged_power',
  'Главные котлы': 'main_boilers',
  'Радио-навигационное оборудование': 'radio_navigation_equipment',

  // ==== Прочее / системы ====
  'Скорость': 'speed',
  'Холодильная установка': 'refrigeration_system',
  'Рабочая температура': 'working_temperature',
  'Хладагенты': 'refrigerants',
  'Запасы топлива': 'fuel_reserves',
  'Типы топлива': 'fuel_types',
  'Водяной балласт': 'ballast',
  'Подогреватели': 'heaters',
  'Характеристика снабжения': 'supply_characteristics',
  'Категория якорных цепей': 'anchor_chain_category',
  'Калибр якорных цепей': 'anchor_chain_caliber',
  'Примечания': 'notes'
};

// Раскладка по секциям <details>
const categories = {
  generalInfo: [
    'Название судна', 'Регистровый номер', 'Регис тровый номер', 'Номер ИМО', 'IMO',
    'Бывшее название', 'Позывной', 'Порт приписки', 'Флаг', 'Символ класса',
    'Переоборудование/модернизация существенного характера', 'Основной тип',
    'Орг. группа', 'Место постройки', 'Страна постройки', 'Строительный номер',
    'Владелец', 'Оператор', 'Регистрация', 'Учреждение регистрации',
    'Бортовой номер', 'MMSI', 'Текущее состояние',
    'Завод постройки', 'Город постройки', 'Завод достройки', 'Город достройки',
    'Заложено', 'Дата закладки киля', 'Дата значительной части',
    'Дата постройки (первое освидетельствование)', 'Спущено на воду', 'Построено',
    'Проект судна', 'Назначение судна', 'Формула класса'
  ],
  dimensions: [
    'Длина наибольшая (теоретическая)', 'Длина наибольшая теоретическая',
    'Длина габаритная', 'Длина расчетная', 'Длина конструктивная',
    'Ширина габаритная', 'Ширина конструктивная',
    'Высота борта', 'Высота надводного борта', 'Надводный борт',
    'Осадка', 'Валовая вместимость', 'Чистая вместимость', 'Дедвейт',
    'Водоизмещение', 'Кубатура грузовых трюмов', 'Грузоподъемность'
  ],
  cargoInfo: [
    'Количество палуб',
    'Количество переборок', 'Количество переборок поперечных',
    'Количество продольных переборок', 'Количество переборок продольных',
    'Общее количество переборок',
    'Число пассажиров коечные', 'Число пассажиров бескоечных', 'Общее число пассажиров',
    'Охлаждаемые грузовые помещения',
    'Количество охлаждаемых грузовых помещений', 'Вместимость охлаждаемого грузового помещения',
    'Количество грузовых трюмов', 'Количество контейнеров', 'Тип контейнеров',
    'Грузовые люки (число и размер в свету)', 'Стрелы', 'Краны',
    'Количество наливных танков', 'Объём наливного танка', 'Суммарный объем наливных танков'
  ],
  propulsion: [
    'Тип силовой установки', 'Тип движителей', 'Тип движителя',
    'Главные двигатели', 'Марка главной силовой установки', 'Заводская модель главного двигателя',
    'Общая мощность генераторов', 'ГЭД, всего', 'ГЭД, кВт всех',
    'Количество движителей', 'Количество ГЭД', 'Общая мощность ГЭД',
    'Количество лопастей', 'Главные котлы', 'Радио-навигационное оборудование',
    'Скорость'
  ],
  miscellaneous: [
    'Примечания', 'Источник', 'Источник данных',
    'Холодильная установка', 'Рабочая температура', 'Хладагенты',
    'Запасы топлива', 'Типы топлива', 'Водяной балласт', 'Подогреватели',
    'Характеристика снабжения', 'Категория якорных цепей', 'Калибр якорных цепей'
  ]
};

// Рендер деталей выбранной записи
async function loadShipDetails() {
  try {
    const { selectedShip, totalShips } = await ipcRenderer.invoke('get-selected-ship');
    document.querySelectorAll('details table').forEach(table => table.innerHTML = '');

    Object.entries(selectedShip).forEach(([key, value]) => {
      // Ищем русский заголовок по имени поля в БД
      const translatedKey = Object.keys(fieldTranslations).find(
        rusKey => fieldTranslations[rusKey] === key
      );

      if (translatedKey) {
        const row = document.createElement('tr');
        const fieldCell = document.createElement('td');
        fieldCell.textContent = translatedKey;
        const valueCell = document.createElement('td');
        valueCell.textContent = (value === null || value === undefined || value === '') ? '—' : value;

        row.appendChild(fieldCell);
        row.appendChild(valueCell);

        // Определяем секцию
        for (const [categoryId, fields] of Object.entries(categories)) {
          if (fields.includes(translatedKey)) {
            const tbl = document.querySelector(`#${categoryId} table`);
            if (tbl) tbl.appendChild(row);
            return;
          }
        }

        // если поле не попало ни в одну категорию — складываем в "Прочее"
        document.querySelector('#miscellaneous table').appendChild(row);
      }
    });

    const recordStatus = document.getElementById('recordStatus');
    if (recordStatus) {
      recordStatus.textContent = `Запись ID: ${selectedShip.id} из ${totalShips} записей`;
    }
  } catch (error) {
    console.error('Ошибка при загрузке деталей судна:', error);
  }
}

// Старт
loadShipDetails();
