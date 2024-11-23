const fs = require('fs');
const csv = require('csv-parser');
const { MarinFleet } = require('../models'); // Импортируйте вашу модель



const headersMap = {
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

// async function importVesselData() {
//     try {
//         const results = [];

//         // Чтение данных из CSV файла
//         fs.createReadStream('test.csv')
//             .pipe(csv({ separator: ';' }))
//             .on('data', (row) => {
//                 // Убираем лишние кавычки и пробелы в ключах
//                 const cleanRow = Object.keys(row).reduce((acc, key) => {
//                     const cleanKey = key.replace(/"/g, '').trim(); // Убираем кавычки и пробелы
//                     acc[cleanKey] = row[key];
//                     return acc;
//                 }, {});

//                 // Печатаем очищенную строку для отладки
//                 console.log('Cleaned row:', JSON.stringify(cleanRow));

//                 const vesselName = cleanRow['Название судна'];  // Считываем название судна
//                 const regNumber = cleanRow['Регистровый номер']; // Считываем регистровый номер
//                 const imoNumber = cleanRow['Номер ИМО']; // Считываем номер ИМО
//                 const formerName = cleanRow['Бывшее название']; // Считываем бывшее название

//                 // Добавьте остальные поля по аналогии
//                 const callsign = cleanRow['Позывной'];
//                 const portOfRegistry = cleanRow['Порт приписки'];
//                 const flag = cleanRow['Флаг'];
//                 const classSymbol = cleanRow['Символ класса'];
//                 const majorConversion = cleanRow['Переоборудование/модернизация существенного характера'];

//                 // Если какие-то поля могут быть пустыми, можно добавить проверку
//                 const data = {
//                     vessel_name: vesselName,
//                     reg_number: regNumber,
//                     imo_number: imoNumber,
//                     former_name: formerName,
//                     callsign: callsign,
//                     port_of_registry: portOfRegistry,
//                     flag: flag,
//                     class_symbol: classSymbol,
//                     major_conversion: majorConversion,
//                     // Добавьте остальные поля сюда
//                 };

//                 results.push(data);  // Добавляем данные в массив
//             })
//             .on('end', async () => {
//                 console.log('CSV file successfully processed.');
//                 console.log('Parsed Vessel Data:', results);

//                 // Вставка данных в базу данных
//                 for (const vesselData of results) {
//                     await MarinFleet.create(vesselData); // Создаем запись в базе данных для каждого судна
//                     console.log(`Added to DB: ${vesselData.vessel_name}`); // Печатаем добавленные данные
//                 }
//                 console.log('Data successfully added to the database.');
//             });
//     } catch (error) {
//         console.error('Error importing vessel data:', error);
//     }
// }
async function importVesselData(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv({ separator: ';' }))
            .on('data', (row) => {
                const cleanRow = Object.keys(row).reduce((acc, key) => {
                    acc[key.trim()] = row[key];
                    return acc;
                }, {});

            // Создаем объект данных для вставки в базу
            results.push({
                vessel_name: cleanRow['Название судна'],
                reg_number: cleanRow['Регистровый номер'],
                imo_number: cleanRow['Номер ИМО'],
                former_name: cleanRow['Бывшее название'],
                callsign: cleanRow['Позывной'],
                port_of_registry: cleanRow['Порт приписки'],
                flag: cleanRow['Флаг'],
                class_symbol: cleanRow['Символ класса'],
                major_conversion: cleanRow['Переоборудование/модернизация существенного характера'],
                main_type: cleanRow['Основной тип'],
                build_date: cleanRow['Дата постройки'],
                build_country: cleanRow['Страна постройки'],
                build_number: cleanRow['Строительный номер'],
                major_part_date: cleanRow['Дата значительной части'],
                major_part: cleanRow['Значительная часть'],
                gross_tonnage: cleanRow['Валовая вместимость'],
                net_tonnage: cleanRow['Чистая вместимость'],
                deadweight: cleanRow['Дедвейт'],
                displacement: cleanRow['Водоизмещение'],
                max_length: cleanRow['Длина наибольшая (теоретическая)'],
                overall_length: cleanRow['Длина габаритная'],
                calc_length: cleanRow['Длина расчетная'],
                overall_width: cleanRow['Ширина габаритная'],
                side_height: cleanRow['Высота борта'],
                draft: cleanRow['Осадка'],
                speed: cleanRow['Скорость'],
                propulsion_type: cleanRow['Тип силовой установки'],
                main_engines: cleanRow['Главные двигатели'],
                propeller_count: cleanRow['Количество лопастей'],
                total_generator_power: cleanRow['Общая мощность генераторов'],
                main_boilers: cleanRow['Главные котлы'],
                refrigeration_system: cleanRow['Холодильная установка'],
                working_temperature: cleanRow['Рабочая температура'],
                refrigerants: cleanRow['Хладагенты'],
                radio_navigation_equipment: cleanRow['Радио-навигационное оборудование'],
                refrigerated_cargo_space: cleanRow['Охлаждаемые грузовые помещения'],
                tanks: cleanRow['Наливные танки'],
                deck_count: cleanRow['Количество палуб'],
                transverse_bulkheads_count: cleanRow['Количество переборок'],
                bed_passenger_count: cleanRow['Число пассажиров коечных'],
                non_bed_passenger_count: cleanRow['Число пассажиров бескоечных'],
                special_personnel: cleanRow['Спецперсонал'],
                cargo_hatches: cleanRow['Грузовые люки (число и размер в свету)'],
                booms: cleanRow['Стрелы'],
                cranes: cleanRow['Краны'],
                fuel_reserves: cleanRow['Запасы топлива'],
                fuel_types: cleanRow['Типы топлива'],
                ballast: cleanRow['Водяной балласт'],
                heaters: cleanRow['Подогреватели'],
                supply_characteristics: cleanRow['Характеристика снабжения'],
                anchor_chain_category: cleanRow['Категория якорных цепей'],
                anchor_chain_caliber: cleanRow['Калибр якорных цепей'],
                vessel_project: cleanRow['Проект судна'],
                first_inspection_date: cleanRow['Дата постройки (первое освидетельствование)'],
                build_location: cleanRow['Место постройки'],
                design_length: cleanRow['Длина конструктивная'],
                design_width: cleanRow['Ширина конструктивная'],
                freeboard_height: cleanRow['Высота надводного борта'],
                lifting_capacity: cleanRow['Грузоподъемность'],
                longitudinal_bulkheads_count: cleanRow['Количество продольных переборок'],
                passenger_capacity: cleanRow['Пассажировместимость'],
                crew_size: cleanRow['Экипаж'],
                org_group: cleanRow['Орг. группа'],
                total_tank_volume: cleanRow['Суммарный объем наливных танков'],
                boom_1_capacity: cleanRow['Грузоподъемность первой стрелы'],
                boom_2_capacity: cleanRow['Грузоподъемность второй стрелы'],
                boom_3_capacity: cleanRow['Грузоподъемность третьей стрелы'],
                hull_material: cleanRow['Материал корпуса'],
                superstructure_material: cleanRow['Материал надстройки'],
                propulsion_model: cleanRow['Марка главной силовой установки'],
                total_electric_generators: cleanRow['ГЭД, всего'],
                total_ged_power: cleanRow['ГЭС, кВт всех'],
                factory_location: cleanRow['Завод постройки'],
                build_city: cleanRow['Город постройки'],
                refit_factory: cleanRow['Завод достройки'],
                refit_city: cleanRow['Город достройки'],
                laid_down_date: cleanRow['Заложено'],
                launch_date: cleanRow['Спущено на воду'],
                completion_date: cleanRow['Построено'],
                owner: cleanRow['Владелец'],
                operator: cleanRow['Оператор'],
                registration: cleanRow['Регистрация'],
                board_number: cleanRow['Бортовой номер'],
                mmsi: cleanRow['MMSI'],
                current_status: cleanRow['Текущее состояние'],
                notes: cleanRow['Примечания'],
                propulsion_count: cleanRow['Количество движителей'],
                ged_count: cleanRow['Количество ГЭД'],
                cargo_hold_count: cleanRow['Количество грузовых трюмов'],
                cargo_hold_volume: cleanRow['Кубатура грузовых трюмов'],
                container_count: cleanRow['Количество контейнеров'],
                container_type: cleanRow['Тип контейнеров'],
                source: cleanRow['Источник']
            });
            
        })
        .on('end', async () => {
            try {
                await MarinFleet.bulkCreate(results); // Добавляем все записи в базу
                resolve('Data successfully imported');
            } catch (error) {
                reject(`Database error: ${error.message}`);
            }
        })
        .on('error', (error) => {
            reject(`CSV processing error: ${error.message}`);
        });
});
}

// importVesselData("mergedRegisters (2).csv");


module.exports = { importVesselData };