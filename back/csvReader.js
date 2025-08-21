const fs = require('fs');
const csv = require('csv-parser');
const { MarinFleet } = require('../database/models'); // Импортируйте вашу модель


async function importVesselData(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv({ separator: ';' }))
            .on('data', (row) => {
                const cleanRow = Object.keys(row).reduce((acc, key) => {
                    acc[key.trim()] = row[key] || 'Нет данных';
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