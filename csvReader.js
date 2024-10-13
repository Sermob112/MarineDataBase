const fs = require('fs');
const csv = require('csv-parser');
const { MarinFleet } = require('./models'); // Импортируйте вашу модель

// Метод для чтения CSV и добавления данных в базу
async function importCsvToDb(csvFilePath) {
    const entries = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                // Пушим каждую строку (объект) в массив
                entries.push({
                    reg_no: row['Регистровый номер'],
                    name: row['Название судна'],
                    vessel_name: row['Название судна'],
                    reg_number: row['Регистровый номер'],
                    imo_number: row['Номер ИМО'],
                    callsign: row['Позывной'],
                    port_of_registry: row['Порт приписки'],
                    flag: row['Флаг'],
                    class_symbol: row['Символ класса'],
                    main_type: row['Основной тип'],
                    build_date: row['Дата постройки'],
                    build_country: row['Страна постройки'],
                    build_number: row['Строительный номер'],
                    gross_tonnage: row['Валовая вместимость'],
                    net_tonnage: row['Чистая вместимость'],
                    deadweight: row['Дедвейт'],
                    displacement: row['Водоизмещение'],
                    overall_length: row['Длина наибольшая (теоретическая)'],
                    width: row['Ширина габаритная'],
                    height: row['Высота борта'],
                    draft: row['Осадка'],
                    speed: row['Скорость'],
                    propulsion_type: row['Тип силовой установки'],
                    propeller_count: row['Количество лопастей'],
                    generator_power: row['Общая мощность генераторов'],
                    main_boilers: row['Главные котлы'],
                    refrigeration_system: row['Холодильная установка'],
                    working_temperature: row['Рабочая температура'],
                    refrigerants: row['Хладагенты'],
                    cargo_holds: row['Охлаждаемые грузовые помещения'],
                    tanks: row['Наливные танки'],
                    deck_count: row['Количество палуб'],
                    bulkheads_count: row['Количество переборок'],
                    bed_passenger_count: row['Число пассажиров коечные'],
                    non_bed_passenger_count: row['Число пассажиров бескоечных'],
                    special_personnel: row['Спецперсонал'],
                    cargo_hatches: row['Грузовые люки (число и размер в свету)'],
                    booms: row['Стрелы'],
                    cranes: row['Краны'],
                    fuel_reserves: row['Запасы топлива'],
                    fuel_types: row['Типы топлива'],
                    ballast: row['Водяной балласт'],
                    heaters: row['Подогреватели'],
                    supply_characteristics: row['Характеристика снабжения'],
                    anchor_chain_category: row['Категория якорных цепей'],
                    anchor_chain_caliber: row['Калибр якорных цепей'],
                    vessel_project: row['Проект судна'],
                    first_inspection_date: row['Дата постройки (первое освидетельствование)'],
                    build_location: row['Место постройки'],
                    design_length: row['Длина конструктивная'],
                    design_width: row['Ширина конструктивная'],
                    freeboard_height: row['Высота надводного борта'],
                    lifting_capacity: row['Грузоподъемность'],
                    transverse_bulkheads_count: row['Количество поперечных переборок'],
                    longitudinal_bulkheads_count: row['Количество продольных переборок'],
                    passenger_capacity: row['Пассажировместимость'],
                    crew_size: row['Экипаж'],
                    tank_count: row['Количество наливных танков'],
                    total_tank_volume: row['Суммарный объем наливных танков'],
                    boom_1_capacity: row['Грузоподъемность первой стрелы'],
                    boom_2_capacity: row['Грузоподъемность второй стрелы'],
                    boom_3_capacity: row['Грузоподъемность третьей стрелы'],
                    hull_material: row['Материал корпуса'],
                    superstructure_material: row['Материал надстройки'],
                    propulsion_model: row['Марка главной силовой установки'],
                    total_electric_generators: row['ГЭД, всего'],
                    total_generator_power: row['ГЭД, кВт всех'],
                    factory_location: row['Завод постройки'],
                    build_city: row['Город постройки'],
                    refit_factory: row['Завод достройки'],
                    refit_city: row['Город достройки'],
                    laid_down_date: row['Заложено'],
                    launch_date: row['Спущено на воду'],
                    completion_date: row['Построено'],
                    owner: row['Владелец'],
                    operator: row['Оператор'],
                    registration: row['Регистрация'],
                    board_number: row['Бортовой номер'],
                    mmsi: row['MMSI'],
                    current_status: row['Текущее состояние'],
                    notes: row['Примечания'],
                    propulsion_count: row['Количество движителей'],
                    propulsion_type: row['Тип движителей'],
                    ged_count: row['Количество ГЭД'],
                    total_ged_power: row['Общая мощность ГЭД'],
                    cargo_hold_count: row['Количество грузовых трюмов'],
                    cargo_hold_volume: row['Кубатура грузовых трюмов'],
                    container_count: row['Количество контейнеров'],
                    container_type: row['Тип контейнеров'],
                    source: row['Источник']
                });
            })
            .on('end', async () => {
                try {
                    // Вставляем все записи в базу данных
                    await MarinFleet.bulkCreate(entries);
                    resolve('CSV файл успешно импортирован в базу данных!');
                } catch (error) {
                    reject(`Ошибка импорта в базу данных: ${error.message}`);
                }
            })
            .on('error', (error) => {
                reject(`Ошибка чтения CSV файла: ${error.message}`);
            });
    });
}
// importCsvToDb('mergedRegisters.csv')
//     .then(message => console.log(message))
//     .catch(error => console.error(error));

module.exports = importCsvToDb;