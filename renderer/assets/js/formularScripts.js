const { ipcRenderer } = require('electron');

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
const categories = {
  generalInfo: [
    'Название судна', 'Регистровый номер', 'Номер ИМО', 'Бывшее название',
    'Позывной', 'Порт приписки', 'Флаг', 'Символ класса',
    'Переоборудование/модернизация существенного характера', 'Основной тип',
    'Дата постройки', 'Страна постройки', 'Строительный номер',
    'Дата значительной части', 'Значительная часть', 'Орг. группа',
    'Дата постройки (первое освидетельствование)', 'Место постройки',
    'Владелец', 'Оператор', 'Регистрация', 'Бортовой номер', 'MMSI',
    'Текущее состояние', 'Завод постройки', 'Город постройки',
    'Завод достройки', 'Город достройки', 'Заложено', 'Спущено на воду',
    'Построено'
  ],
  dimensions: [
    'Длина наибольшая (теоретическая)', 'Длина габаритная',
    'Длина расчетная', 'Длина конструктивная', 'Ширина габаритная',
    'Ширина конструктивная', 'Высота борта', 'Высота надводного борта',
    'Осадка', 'Валовая вместимость', 'Чистая вместимость', 'Дедвейт',
    'Водоизмещение', 'Кубатура грузовых трюмов'
  ],
  cargoInfo: [
    'Количество палуб', 'Количество наливных танков', 'Количество поперечных переборок',
    'Количество продольных переборок', 'Число пассажиров коечные',
    'Число пассажиров бескоечных', 'Спецперсонал', 'Грузовые люки (число и размер в свету)',
    'Стрелы', 'Краны', 'Грузоподъемность', 'Грузоподъемность первой стрелы',
    'Грузоподъемность второй стрелы', 'Грузоподъемность третьей стрелы',
    'Количество грузовых трюмов', 'Количество контейнеров', 'Тип контейнеров',
    'Охлаждаемые грузовые помещения', 'Суммарный объем наливных танков'
  ],
  propulsion: [
    'Тип силовой установки', 'Главные двигатели', 'Общая мощность генераторов',
    'Главные котлы', 'Рабочая температура', 'Хладагенты', 'Радио-навигационное оборудование',
    'Марка главной силовой установки', 'ГЭД, всего', 'ГЭД, кВт всех',
    'Количество движителей', 'Тип движителей', 'Количество ГЭД',
    'Общая мощность ГЭД', 'Количество лопастей'
  ],
  miscellaneous: [
    'Примечания', 'Источник', 'Холодильная установка', 'Запасы топлива',
    'Типы топлива', 'Водяной балласт', 'Подогреватели', 'Характеристика снабжения',
    'Категория якорных цепей', 'Калибр якорных цепей', 'Проект судна', 
    'Скорость', 'Экипаж', 'fuel_reserves'
  ]
};

// Функция для отображения текущего статуса записи

async function loadShipDetails() {
  try {
    const { selectedShip, totalShips } = await ipcRenderer.invoke('get-selected-ship');
    document.querySelectorAll('details table').forEach(table => table.innerHTML = '');

    Object.entries(selectedShip).forEach(([key, value]) => {
      const translatedKey = Object.keys(fieldTranslations).find(
        rusKey => fieldTranslations[rusKey] === key
      );

      if (translatedKey) {
        const row = document.createElement('tr');
        const fieldCell = document.createElement('td');
        fieldCell.textContent = translatedKey;
        const valueCell = document.createElement('td');
        valueCell.textContent = value;

        row.appendChild(fieldCell);
        row.appendChild(valueCell);

        // Определяем к какой категории относится поле
        for (const [categoryId, fields] of Object.entries(categories)) {
          if (fields.includes(translatedKey)) {
            document.querySelector(`#${categoryId} table`).appendChild(row);
            break;
          }
        }
      }
    });

    const recordStatus = document.getElementById('recordStatus');
    recordStatus.textContent = `Запись ID: ${selectedShip.id} из ${totalShips} записей`;
  } catch (error) {
    console.error('Ошибка при загрузке деталей судна:', error);
  }
}


// Загружаем детали при открытии страницы
loadShipDetails();
