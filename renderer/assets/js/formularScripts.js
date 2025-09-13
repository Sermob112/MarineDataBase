// assets/js/formularScripts.js
const { ipcRenderer } = require('electron');

/** Русский заголовок -> поле модели (унифицированные имена как в MarinFleet) */
const fieldTranslations = {
  // ==== Идентификация / общие ====
  'Название судна': 'vessel_name',
  'Регистровый номер': 'reg_number',
  'Регис тровый номер': 'reg_number',        // ALIAS (с пробелом)
  'Номер ИМО': 'imo_number',
  'IMO': 'imo_number',                        // ALIAS
  'MMSI': 'mmsi',
  'Бывшее название': 'former_name',
  'Позывной': 'callsign',
  'Порт приписки': 'port_of_registry',
  'Флаг': 'flag',
  'Символ класса': 'class_symbol',
  'Переоборудование/модернизация существенного характера': 'major_conversion',
  'Основной тип': 'main_type',
  'Проект судна': 'vessel_project',
  'Назначение судна': 'vessel_purpose',
  'Формула класса': 'class_formula',
  'Источник данных': 'data_source',
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
  'Учреждение регистрации': 'registration_authority',
  'Регистрация': 'registration',
  'Текущее состояние': 'current_status',
  'Владелец': 'owner',
  'Оператор': 'operator',
  'Бортовой номер': 'board_number',

  // ==== Даты строительства ====
  'Заложено': 'laid_down_date',
  'Дата закладки киля': 'keel_laying_date',
  'Дата значительной части': 'major_part_date',
  'Значительная часть': 'major_part',
  'Дата постройки (первое освидетельствование)': 'first_inspection_date',
  'Спущено на воду': 'launch_date',
  'Построено': 'completion_date',

  // ==== Размерения / вместимости ====
  'Длина наибольшая (теоретическая)': 'max_length', // SeaFleet unified
  'Длина наибольшая теоретическая': 'max_length',
  'Длина габаритная': 'overall_length',
  'Длина расчетная': 'calc_length',
  'Длина конструктивная': 'design_length',
  'Ширина габаритная': 'overall_width',
  'Ширина конструктивная': 'design_width',
  'Высота борта': 'side_height',
  'Высота надводного борта': 'freeboard_height',
  'Надводный борт': 'freeboard_height',
  'Осадка': 'draft',
  'Валовая вместимость': 'gross_tonnage',
  'Чистая вместимость': 'net_tonnage',
  'Дедвейт': 'deadweight',
  'Водоизмещение': 'displacement',
  'Грузоподъемность': 'lifting_capacity',
  'Кубатура грузовых трюмов': 'cargo_hold_volume',

  // ==== Пассажиры / экипаж ====
  'Экипаж': 'crew_size',
  'Численность экипажа': 'crew_size',
  'Число пассажиров коечные': 'bed_passenger_count',
  'Число пассажиров бескоечных': 'non_bed_passenger_count',
  'Пассажировместимость': 'passenger_capacity',
  'Общее число пассажиров': 'passenger_capacity',

  // ==== Грузовые / переборки / танки / контейнеры ====
  'Количество палуб': 'deck_count',
  'Количество переборок': 'transverse_bulkheads_count',
  'Количество переборок поперечных': 'transverse_bulkheads_count',
  'Количество продольных переборок': 'longitudinal_bulkheads_count',
  'Количество переборок продольных': 'longitudinal_bulkheads_count',
  'Общее количество переборок': 'bulkheads_total_count',

  'Количество грузовых трюмов': 'cargo_hold_count',
  'Грузовые люки (число и размер в свету)': 'cargo_hatches',
  'Стрелы': 'booms',
  'Краны': 'cranes',

  'Охлаждаемые грузовые помещения': 'refrigerated_cargo_space',
  'Количество охлаждаемых грузовых помещений': 'refrigerated_cargo_space_count',
  'Вместимость охлаждаемого грузового помещения': 'refrigerated_cargo_space_capacity',

  'Количество наливных танков': 'tanks_count',
  'Объём наливного танка': 'tank_volume',
  'Суммарный объем наливных танков': 'total_tank_volume',

  'Количество контейнеров': 'container_count',
  'Тип контейнеров': 'container_type',

  // ==== Энергетика / пропульсивный комплекс ====
  'Тип силовой установки': 'propulsion_type',
  'Тип движителей': 'propulsion_type',
  'Тип движителя': 'propulsor_type',
  'Главные двигатели': 'main_engines',
  'Марка главной силовой установки': 'propulsion_model',
  'Заводская модель главного двигателя': 'main_engine_model',
  'Количество лопастей': 'propeller_count', // у SeaFleet есть blades_count — покажем фолбэком если нет маппинга
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
  'Примечания': 'notes',

  // ==== Морские "оригинальные" ключи (на случай, если модель не унифицирована) ====
  'Материал корпуса': 'hull_material',
  'Количество и тип движителя': 'propulsor_count_type',
  'Количество и мощность генераторов': 'generators_count_power',
  'Количество и мощность ГЭД': 'ged_count_power',
  'Наливные танки': 'tanks_info',
  'Количество и тип контейнеров': 'container_count_type',
  'Грузовые люки (мор.)': 'cargo_hatches_info',
  'Количество грузовых трюмов (мор.)': 'cargo_hold_count_volume',
  'Лопасти (шт.)': 'blades_count',
};

/** Секции <details> в shipFormular.html */
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
    'Проект судна', 'Назначение судна', 'Формула класса',
    // добавим материал корпуса сюда
    'Материал корпуса'
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
    'Количество наливных танков', 'Объём наливного танка', 'Суммарный объем наливных танков',
    // морские оригинальные названия — на всякий случай
    'Наливные танки', 'Количество и тип контейнеров', 'Грузовые люки (мор.)', 'Количество грузовых трюмов (мор.)'
  ],
  propulsion: [
    'Тип силовой установки', 'Тип движителей', 'Тип движителя',
    'Главные двигатели', 'Марка главной силовой установки', 'Заводская модель главного двигателя',
    'Общая мощность генераторов', 'ГЭД, всего', 'ГЭД, кВт всех',
    'Количество движителей', 'Количество ГЭД', 'Общая мощность ГЭД',
    'Количество лопастей', 'Лопасти (шт.)',
    'Главные котлы', 'Радио-навигационное оборудование',
    'Скорость',
    // морские оригинальные
    'Количество и тип движителя', 'Количество и мощность генераторов', 'Количество и мощность ГЭД'
  ],
  miscellaneous: [
    'Примечания', 'Источник', 'Источник данных',
    'Холодильная установка', 'Рабочая температура', 'Хладагенты',
    'Запасы топлива', 'Типы топлива', 'Водяной балласт', 'Подогреватели',
    'Характеристика снабжения', 'Категория якорных цепей', 'Калибр якорных цепей'
  ]
};

// Обратная карта: поле модели -> русский заголовок (первое совпадение)
const DB_TO_RU = (() => {
  const map = new Map();
  for (const [ru, db] of Object.entries(fieldTranslations)) {
    if (!map.has(db)) map.set(db, ru);
  }
  return map;
})();

function $q(sel) { return document.querySelector(sel); }
function clearAllTables() {
  document.querySelectorAll('details table').forEach(t => t.innerHTML = '');
}
function appendRowTo(categoryId, label, value) {
  const tbl = $q(`#${categoryId} table`);
  if (!tbl) return false;
  const tr = document.createElement('tr');
  const tdK = document.createElement('td'); tdK.textContent = label;
  const tdV = document.createElement('td'); tdV.textContent =
    (value === null || value === undefined || value === '') ? '—' : String(value);
  tr.append(tdK, tdV);
  tbl.appendChild(tr);
  return true;
}

function placeRow(label, value) {
  // Пытаемся найти секцию по человеческому заголовку
  for (const [catId, list] of Object.entries(categories)) {
    if (list.includes(label)) {
      if (appendRowTo(catId, label, value)) return;
    }
  }
  // Если не нашли — кладём в "Прочее"
  appendRowTo('miscellaneous', label, value);
}

async function loadShipDetails() {
  try {
    const resp = await ipcRenderer.invoke('get-selected-ship'); // { selectedShip, model, totalShips? }
    const selectedShip = resp?.selectedShip || {};
    
    const model = resp?.model || 'MarinFleet';
    const totalShips = resp?.totalShips;
    console.log('MODEL:', model, 'FIELDS:', Object.keys(selectedShip));
    clearAllTables();

    // Статус/заголовок
    const status = $q('#recordStatus');
    if (status) {
      const idText = selectedShip?.id ? `ID: ${selectedShip.id}` : '—';
      const totalText = totalShips ? ` из ${totalShips}` : '';
      status.textContent = `Запись ${idText}${totalText} (${model})`;
    }

    // Рисуем все поля
    for (const [dbKey, value] of Object.entries(selectedShip)) {
      // ищем красивый лейбл — по обратной карте
      const ruLabel = DB_TO_RU.get(dbKey) || dbKey; // фолбэк: техническое имя
      placeRow(ruLabel, value);
    }
  } catch (err) {
    console.error('Ошибка при загрузке деталей судна:', err);
  }
}

function initFormular() {
  loadShipDetails();
}

// Если лэйаут уже подменил body — отрисуем сразу
if (window.__layoutLoaded) {
  initFormular();
} else {
  // Иначе дождёмся, когда базовый макет вставится
  document.addEventListener('layout:ready', initFormular, { once: true });

  // На всякий случай: если кто-то открыл страницу без base.html
  document.addEventListener('DOMContentLoaded', () => {
    if (window.__layoutLoaded) initFormular();
  }, { once: true });
}