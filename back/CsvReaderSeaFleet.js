// CsvReaderSeaFleet.js
// Импорт речных судов в таблицу SeaFleet по русским заголовкам

const fs = require('fs');
const csv = require('csv-parser');

// ВАЖНО: сначала инициализируем соединение/модели
const db = require('../database/db');
const models = require('../database/models');

// Нормализация ключей: trim + схлопывание внутренних пробелов
const normalizeKey = (k) => String(k ?? '').replace(/\s+/g, ' ').trim();

// Маппинг русских заголовков -> поля модели SeaFleet
const headersMap = {
  // Идентификация
  'Название судна': 'vessel_name',
  'Регистровый номер': 'reg_number',
  'Номер ИМО': 'imo_number',
  'Бывшее название': 'former_name',
  'Позывной': 'callsign',
  'Порт приписки': 'port_of_registry',
  'Флаг': 'flag',
  'Символ класса': 'class_symbol',
  'Переоборудование/модернизация существенного характера': 'major_conversion',
  'Материал корпуса': 'hull_material',
  'Тип судна': 'main_type',

  // Даты / постройка
  'Дата закладки киля': 'keel_laying_date',
  'Дата постройки': 'build_date',
  'Страна постройки': 'build_country',
  'Строительный номер': 'build_number',
  'Дата значительной части': 'major_part_date',
  'Значительная часть': 'major_part',

  // Вместимости
  'Валовая вместимость': 'gross_tonnage',
  'Чистая вместимость': 'net_tonnage',
  'Дедвейт': 'deadweight',
  'Водоизмещение': 'displacement',

  // Размерения (унифицировано)
  'Длина наибольшая (теоретическая)': 'max_length',      // было max_length_theoretical
  'Длина габаритная': 'overall_length',
  'Длина расчетная': 'calc_length',
  'Ширина габаритная': 'overall_width',
  'Высота борта': 'side_height',
  'Осадка': 'draft',

  // Ходкость / ЭУ
  'Скорость': 'speed',
  'Тип силовой установки': 'propulsion_type',
  'Главные двигатели': 'main_engines',

  // Энергетика (унифицировано)
  'Количество и мощность ГЭД': 'total_ged_power',         // было ged_count_power
  'Количество и тип движителя': 'propulsor_type',         // было propulsor_count_type
  'Количество лопастей': 'blades_count',                  // поле SeaFleet
  'Количество и мощность генераторов': 'total_generator_power', // было generators_count_power
  'Главные котлы': 'main_boilers',

  // Оборудование
  'Холодильная установка': 'refrigeration_system',
  'Рабочая температура': 'working_temperature',
  'Хладагенты': 'refrigerants',
  'Радио-навигационное оборудование': 'radio_navigation_equipment',

  // Грузовые помещения (унифицировано)
  'Количество и кубатура грузовых трюмов': 'cargo_hold_count', // было cargo_hold_count_volume
  'Охлаждаемые грузовые помещения': 'refrigerated_cargo_space',// было refrigerated_cargo_spaces
  'Наливные танки': 'tanks',                                   // было tanks_info
  'Количество и тип контейнеров': 'container_type',            // было container_count_type
  'Количество палуб': 'deck_count',
  'Количество переборок': 'bulkheads_total_count',             // было bulkheads_count

  // Пассажиры / экипаж
  'Число пассажиров коечные': 'bed_passenger_count',
  'Число пассажиров бескоечных': 'non_bed_passenger_count',
  'Спецперсонал': 'special_personnel',

  // Грузовое оснащение (унифицировано)
  'Грузовые люки (число и размер в свету)': 'cargo_hatches',   // было cargo_hatches_info
  'Стрелы': 'booms',
  'Краны': 'cranes',

  // Прочее
  'Запасы топлива': 'fuel_reserves',
  'Типы топлива': 'fuel_types',
  'Водяной балласт': 'ballast',
  'Подогреватели': 'heaters',
  'Характеристика снабжения': 'supply_characteristics',
  'Категория якорных цепей': 'anchor_chain_category',
  'Калибр якорных цепей': 'anchor_chain_caliber'
};
// Преобразование CSV-строки -> объект для SeaFleet
function rowToRiverModel(cleanRow) {
  const out = {};
  for (const [ruKey, field] of Object.entries(headersMap)) {
    const val = cleanRow[normalizeKey(ruKey)];
    out[field] = (val === undefined || val === null || val === '') ? 'Нет данных' : String(val).trim();
  }
  return out;
}

/**
 * Импорт CSV в SeaFleet
 * @param {string} filePath - путь к CSV
 * @param {object} opts
 * @param {boolean} opts.authenticate - проверить соединение с БД
 * @param {number}  opts.chunkSize - размер пакета при вставке (0 = одним махом)
 * @param {string}  opts.separator - разделитель CSV (';' по умолчанию)
 */
async function importSeaFleetCsv(filePath, { authenticate = true, chunkSize = 0, separator = ';' } = {}) {
  if (authenticate && db?.sequelizer?.authenticate) {
    await db.sequelizer.authenticate().catch(() => {/* можно залогировать */});
  }

  if (!models.SeaFleet || typeof models.SeaFleet.bulkCreate !== 'function') {
    throw new Error('Model SeaFleet is not initialized. Проверьте database/db и database/models.');
  }

  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator }))
      .on('data', (row) => {
        // нормализуем имена колонок и значения
        const cleanRow = Object.keys(row).reduce((acc, key) => {
          const nKey = normalizeKey(key);
          acc[nKey] = (row[key] ?? '').toString().trim();
          return acc;
        }, {});
        results.push(rowToRiverModel(cleanRow));
      })
      .on('end', async () => {
        try {
          if (!results.length) return resolve('Файл пуст или структура колонок не распознана.');

          if (chunkSize && chunkSize > 0) {
            for (let i = 0; i < results.length; i += chunkSize) {
              const chunk = results.slice(i, i + chunkSize);
              await models.SeaFleet.bulkCreate(chunk, { validate: true });
            }
          } else {
            await models.SeaFleet.bulkCreate(results, { validate: true });
          }

          resolve(`Импортировано записей в SeaFleet: ${results.length}`);
        } catch (error) {
          reject(new Error(`Database error: ${error.message}`));
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV processing error: ${error.message}`));
      });
  });
}
importSeaFleetCsv("sea_reg.csv");
module.exports = { importSeaFleetCsv };

// Запуск как скрипта: node CsvReaderSeaFleet.js data.csv ";" 1000
// if (require.main === module) {
//   (async () => {
//     try {
//       const file = process.argv[2];
//       if (!file) throw new Error('Укажите путь к CSV: node CsvReaderSeaFleet.js path/to/file.csv');
//       const sep = process.argv[3] || ';';
//       const chunk = Number(process.argv[4] || 0);
//       const msg = await importSeaFleetCsv(file, { separator: sep, chunkSize: chunk });
//       console.log(msg);
//     } catch (err) {
//       console.error('Fatal:', err.message);
//       process.exit(1);
//     } finally {
//       try { await db.sequelizer.close(); } catch {}
//     }
//   })();
// }
