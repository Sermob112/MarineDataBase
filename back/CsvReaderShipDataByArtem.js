
// Нормализация ключей: trim + схлопывание внутренних пробелов
const normalizeKey = (k) => k.replace(/\s+/g, ' ').trim();

// newCsvReader.js
const fs = require('fs');
const csv = require('csv-parser');

// ВАЖНО: сначала подключаем db — он вызывает models.initModels(...)
const db = require('../database/db');
const models = require('../database/models');



const headersMap = {
  // Обратите внимание на пробел в исходнике "Регис тровый номер"
  'Регис тровый номер': 'reg_number',
  'Строительный номер': 'build_number',
  'IMO': 'imo_number',
  'MMSI': 'mmsi',
  'Название судна': 'vessel_name',
  'Проект судна': 'vessel_project',
  'Назначение судна': 'vessel_purpose',                 // NEW
  'Формула класса': 'class_formula',                    // NEW
  'Источник данных': 'data_source',                     // NEW (не путать с "Источник")
  'Место постройки': 'build_location',
  'Завод постройки': 'factory_location',
  'Город постройки': 'build_city',
  'Страна постройки': 'build_country',
  'Порт приписки': 'port_of_registry',
  'Учреждение регистрации': 'registration_authority',   // NEW
  'Текущее состояние': 'current_status',
  'Заложено': 'laid_down_date',
  'Дата закладки киля': 'keel_laying_date',             // NEW
  'Дата значительной части': 'major_part_date',
  'Спущено на воду': 'launch_date',
  'Построено': 'completion_date',

  'Длина наибольшая теоретическая': 'max_length',
  'Длина расчетная': 'calc_length',
  'Длина габаритная': 'overall_length',
  'Длина конструктивная': 'design_length',
  'Ширина габаритная': 'overall_width',
  'Ширина конструктивная': 'design_width',
  'Валовая вместимость': 'gross_tonnage',
  'Чистая вместимость': 'net_tonnage',
  'Дедвейт': 'deadweight',
  'Грузоподъемность': 'lifting_capacity',
  'Водоизмещение': 'displacement',
  'Осадка': 'draft',
  'Высота борта': 'side_height',
  'Надводный борт': 'freeboard_height',                 // NEW (в старом было "Высота надводного борта")
  'Скорость': 'speed',

  'Тип силовой установки': 'propulsion_type',
  'Заводская модель главного двигателя': 'main_engine_model', // NEW (отличается от propulsion_model)
  'Запасы топлива': 'fuel_reserves',
  'Количество движителей': 'propulsion_count',
  'Тип движителя': 'propulsor_type',                    // NEW (чтобы не путать с propulsion_type)
  'Численность экипажа': 'crew_size',
  'Спецперсонал': 'special_personnel',
  'Число пассажиров коечные': 'bed_passenger_count',
  'Число пассажиров бескоечных': 'non_bed_passenger_count',
  'Общее число пассажиров': 'passenger_capacity',       // NEW (total)

  'Количество лопастей': 'propeller_count',
  'Холодильная установка': 'refrigeration_system',
  'Рабочая температура': 'working_temperature',
  'Хладагенты': 'refrigerants',

  'Количество охлаждаемых грузовых помещений': 'refrigerated_cargo_space_count',   // NEW
  'Вместимость охлаждаемого грузового помещения': 'refrigerated_cargo_space_capacity', // NEW

  'Количество наливных танков': 'tanks_count',          // NEW
  'Объём наливного танка': 'tank_volume',               // NEW (на один, не суммарный)
  'Суммарный объем наливных танков': 'total_tank_volume',

  'Количество контейнеров': 'container_count',
  'Тип контейнеров': 'container_type',

  'Количество палуб': 'deck_count',
  'Количество переборок продольных': 'longitudinal_bulkheads_count',
  'Количество переборок поперечных': 'transverse_bulkheads_count',
  'Общее количество переборок': 'bulkheads_total_count', // NEW

  'Водяной балласт': 'ballast',
  'Подогреватели': 'heaters',
  'Категория якорных цепей': 'anchor_chain_category',
  'Калибр якорных цепей': 'anchor_chain_caliber'
};

function rowToModel(cleanRow) {
  const out = {};
  for (const [ruKey, field] of Object.entries(headersMap)) {
    // Берём значение по нормализованному ключу
    const val = cleanRow[normalizeKey(ruKey)];
    out[field] = (val === undefined || val === null || val === '') ? 'Нет данных' : val;
  }
  return out;
}
async function importVesselDataNew(filePath, { authenticate = true, chunkSize = 0 } = {}) {
  // при необходимости проверяем соединение
  if (authenticate && db?.sequelizer?.authenticate) {
    await db.sequelizer.authenticate().catch(() => {/* опционально лог */});
  }

  // контроль инициализации модели
  if (!models.MarinFleet || typeof models.MarinFleet.bulkCreate !== 'function') {
    throw new Error('Model MarinFleet is not initialized. Check database/db initialization.');
  }

  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        const cleanRow = Object.keys(row).reduce((acc, key) => {
          const nKey = normalizeKey(key);
          acc[nKey] = (row[key] ?? '').toString().trim();
          return acc;
        }, {});
        results.push(rowToModel(cleanRow));
      })
      .on('end', async () => {
        try {
          if (!results.length) return resolve('Файл пуст или не распознан.');

          // При больших объёмах можно включить чанкинг
          if (chunkSize && chunkSize > 0) {
            for (let i = 0; i < results.length; i += chunkSize) {
              const chunk = results.slice(i, i + chunkSize);
              await models.MarinFleet.bulkCreate(chunk, { validate: true });
            }
          } else {
            await models.MarinFleet.bulkCreate(results, { validate: true });
          }

          resolve(`Импортировано записей: ${results.length}`);
        } catch (error) {
          reject(new Error(`Database error: ${error.message}`));
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV processing error: ${error.message}`));
      });
  });
}

// importVesselDataNew("ship_data_razdel_3.csv");
module.exports = { importVesselDataNew };
// if (require.main === module) {
//   (async () => {
//     try {
//       const file = process.argv[2] || 'ship_data_razdel_3.csv';
//       const msg = await importVesselDataNew(file);
//       console.log(msg);
//     } catch (err) {
//       console.error('Fatal:', err);
//       process.exit(1);
//     } finally {
//       try { await db.sequelizer.close(); } catch {}
//     }
//   })();
// }