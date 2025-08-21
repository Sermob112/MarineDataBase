const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config.json');

const sequelizer = new Sequelize(
    config.DB_NAME,
    config.DB_USER,
    config.DB_PASSWORD,
    {
        host: config.DB_HOST,
        port: config.DB_PORT,
        dialect: config.DB_DIALECT,
    }
);
const MarinFleet = sequelizer.define('MarinFleet', {
    // ================= Идентификация =================
    reg_number: { type: DataTypes.TEXT },                     // OLD
    build_number: { type: DataTypes.TEXT },                   // OLD
    imo_number: { type: DataTypes.TEXT },                     // OLD
    mmsi: { type: DataTypes.TEXT },                           // OLD
    vessel_name: { type: DataTypes.TEXT },                    // OLD
    vessel_project: { type: DataTypes.TEXT },                 // OLD
    vessel_purpose: { type: DataTypes.TEXT },                 // NEW (Назначение судна)
    class_symbol: { type: DataTypes.TEXT },                   // OLD
    class_formula: { type: DataTypes.TEXT },                  // NEW (Формула класса)
    source: { type: DataTypes.TEXT },                         // OLD → заменено
    data_source: { type: DataTypes.TEXT },                    // NEW (Источник данных)

    // ================= Постройка =================
    build_date: { type: DataTypes.TEXT },                     // OLD
    build_location: { type: DataTypes.TEXT },                 // OLD
    factory_location: { type: DataTypes.TEXT },               // OLD
    build_city: { type: DataTypes.TEXT },                     // OLD
    build_country: { type: DataTypes.TEXT },                  // OLD
    refit_factory: { type: DataTypes.TEXT },                  // OLD
    refit_city: { type: DataTypes.TEXT },                     // OLD

    // ================= Регистрация =================
    port_of_registry: { type: DataTypes.TEXT },               // OLD
    registration: { type: DataTypes.TEXT },                   // OLD → заменено
    registration_authority: { type: DataTypes.TEXT },         // NEW (Учреждение регистрации)

    // ================= История и даты =================
    former_name: { type: DataTypes.TEXT },                    // OLD
    laid_down_date: { type: DataTypes.TEXT },                 // OLD (Заложено)
    keel_laying_date: { type: DataTypes.TEXT },               // NEW (Дата закладки киля)
    major_part: { type: DataTypes.TEXT },                     // OLD
    major_part_date: { type: DataTypes.TEXT },                // OLD
    launch_date: { type: DataTypes.TEXT },                    // OLD
    completion_date: { type: DataTypes.TEXT },                // OLD
    first_inspection_date: { type: DataTypes.TEXT },          // OLD

    // ================= Размерения =================
    max_length: { type: DataTypes.TEXT },                     // OLD
    calc_length: { type: DataTypes.TEXT },                    // OLD
    overall_length: { type: DataTypes.TEXT },                 // OLD
    design_length: { type: DataTypes.TEXT },                  // OLD
    overall_width: { type: DataTypes.TEXT },                  // OLD
    design_width: { type: DataTypes.TEXT },                   // OLD
    side_height: { type: DataTypes.TEXT },                    // OLD
    freeboard_height: { type: DataTypes.TEXT },               // OLD (в новом “Надводный борт”)

    // ================= Вместимости =================
    gross_tonnage: { type: DataTypes.TEXT },                  // OLD
    net_tonnage: { type: DataTypes.TEXT },                    // OLD
    deadweight: { type: DataTypes.TEXT },                     // OLD
    displacement: { type: DataTypes.TEXT },                   // OLD
    lifting_capacity: { type: DataTypes.TEXT },               // OLD

    // ================= Технические характеристики =================
    speed: { type: DataTypes.TEXT },                          // OLD
    propulsion_type: { type: DataTypes.TEXT },                // OLD
    propulsion_model: { type: DataTypes.TEXT },               // OLD
    main_engines: { type: DataTypes.TEXT },                   // OLD
    main_engine_model: { type: DataTypes.TEXT },              // NEW (Заводская модель)
    propeller_count: { type: DataTypes.TEXT },                // OLD
    propulsion_count: { type: DataTypes.TEXT },               // OLD
    propulsor_type: { type: DataTypes.TEXT },                 // NEW (Тип движителя)

    // ================= Энергетика =================
    total_generator_power: { type: DataTypes.TEXT },          // OLD
    total_electric_generators: { type: DataTypes.TEXT },      // OLD
    ged_count: { type: DataTypes.TEXT },                      // OLD
    total_ged_power: { type: DataTypes.TEXT },                // OLD
    main_boilers: { type: DataTypes.TEXT },                   // OLD

    // ================= Жилые и пассажирские =================
    crew_size: { type: DataTypes.TEXT },                      // OLD
    special_personnel: { type: DataTypes.TEXT },              // OLD
    bed_passenger_count: { type: DataTypes.TEXT },            // OLD
    non_bed_passenger_count: { type: DataTypes.TEXT },        // OLD
    passenger_capacity: { type: DataTypes.TEXT },             // OLD (в новом “Общее число пассажиров”)

    // ================= Грузовые помещения =================
    refrigerated_cargo_space: { type: DataTypes.TEXT },       // OLD
    refrigerated_cargo_space_count: { type: DataTypes.TEXT }, // NEW
    refrigerated_cargo_space_capacity: { type: DataTypes.TEXT }, // NEW

    tanks: { type: DataTypes.TEXT },                          // OLD
    tanks_count: { type: DataTypes.TEXT },                    // NEW
    tank_volume: { type: DataTypes.TEXT },                    // NEW
    total_tank_volume: { type: DataTypes.TEXT },              // OLD

    cargo_hold_count: { type: DataTypes.TEXT },               // OLD
    cargo_hold_volume: { type: DataTypes.TEXT },              // OLD
    container_count: { type: DataTypes.TEXT },                // OLD
    container_type: { type: DataTypes.TEXT },                 // OLD
    cargo_hatches: { type: DataTypes.TEXT },                  // OLD
    booms: { type: DataTypes.TEXT },                          // OLD
    cranes: { type: DataTypes.TEXT },                         // OLD

    // ================= Надстройка, корпус =================
    hull_material: { type: DataTypes.TEXT },                  // OLD
    superstructure_material: { type: DataTypes.TEXT },        // OLD

    // ================= Прочее =================
    flag: { type: DataTypes.TEXT },                           // OLD
    callsign: { type: DataTypes.TEXT },                       // OLD
    major_conversion: { type: DataTypes.TEXT },               // OLD
    main_type: { type: DataTypes.TEXT },                      // OLD
    current_status: { type: DataTypes.TEXT },                 // OLD
    owner: { type: DataTypes.TEXT },                          // OLD
    operator: { type: DataTypes.TEXT },                       // OLD
    org_group: { type: DataTypes.TEXT },                      // OLD
    notes: { type: DataTypes.TEXT },                          // OLD
    supply_characteristics: { type: DataTypes.TEXT },         // OLD

    // ================= Прочие новые =================
    bulkheads_total_count: { type: DataTypes.TEXT },          // NEW (общее количество переборок)
    anchor_chain_category: { type: DataTypes.TEXT },          // OLD
    anchor_chain_caliber: { type: DataTypes.TEXT },           // OLD
    fuel_reserves: { type: DataTypes.TEXT },                  // OLD
    fuel_types: { type: DataTypes.TEXT },                     // OLD
    heaters: { type: DataTypes.TEXT },                        // OLD
    radio_navigation_equipment: { type: DataTypes.TEXT },     // OLD
    working_temperature: { type: DataTypes.TEXT },            // OLD
    refrigerants: { type: DataTypes.TEXT },                   // OLD
    deck_count: { type: DataTypes.TEXT },                     // OLD
    longitudinal_bulkheads_count: { type: DataTypes.TEXT },   // OLD
    transverse_bulkheads_count: { type: DataTypes.TEXT }      // OLD
}, {
    tableName: 'MarinFleet',
    timestamps: false
});

// const MarinFleet = sequelizer.define('MarinFleet', {
//     vessel_name: { type: DataTypes.TEXT },
//     reg_number: { type: DataTypes.TEXT  },
//     imo_number: { type: DataTypes.TEXT  },
//     former_name: { type: DataTypes.TEXT  },
//     callsign: { type: DataTypes.TEXT  },
//     port_of_registry: { type: DataTypes.TEXT },
//     flag: { type: DataTypes.TEXT },
//     class_symbol: { type: DataTypes.TEXT },
//     major_conversion: { type: DataTypes.TEXT },
//     main_type: { type: DataTypes.TEXT },
//     build_date: { type: DataTypes.TEXT },
//     build_country: { type: DataTypes.TEXT },
//     build_number: { type: DataTypes.TEXT },
//     major_part_date: { type: DataTypes.TEXT },
//     major_part: { type: DataTypes.TEXT },
//     gross_tonnage: { type: DataTypes.TEXT },
//     net_tonnage: { type: DataTypes.TEXT },
//     deadweight: { type: DataTypes.TEXT },
//     displacement: { type: DataTypes.TEXT },
//     max_length: { type: DataTypes.TEXT },
//     overall_length: { type: DataTypes.TEXT },
//     calc_length: { type: DataTypes.TEXT },
//     overall_width: { type: DataTypes.TEXT },
//     side_height: { type: DataTypes.TEXT },
//     draft: { type: DataTypes.TEXT },
//     speed: { type: DataTypes.TEXT },
//     propulsion_type: { type: DataTypes.TEXT },
//     main_engines: { type: DataTypes.TEXT },
//     propeller_count: { type: DataTypes.TEXT },
//     total_generator_power: { type: DataTypes.TEXT },
//     main_boilers: { type: DataTypes.TEXT },
//     refrigeration_system: { type: DataTypes.TEXT },
//     working_temperature: { type: DataTypes.TEXT },
//     refrigerants: { type: DataTypes.TEXT },
//     radio_navigation_equipment: { type: DataTypes.TEXT },
//     refrigerated_cargo_space: { type: DataTypes.TEXT },
//     tanks: { type: DataTypes.TEXT },
//     deck_count: { type: DataTypes.TEXT },
//     transverse_bulkheads_count: { type: DataTypes.TEXT },
//     bed_passenger_count: { type: DataTypes.TEXT },
//     non_bed_passenger_count: { type: DataTypes.TEXT },
//     special_personnel: { type: DataTypes.TEXT },
//     cargo_hatches: { type: DataTypes.TEXT },
//     booms: { type: DataTypes.TEXT },
//     cranes: { type: DataTypes.TEXT },
//     fuel_reserves: { type: DataTypes.TEXT },
//     fuel_types: { type: DataTypes.TEXT },
//     ballast: { type: DataTypes.TEXT },
//     heaters: { type: DataTypes.TEXT },
//     supply_characteristics: { type: DataTypes.TEXT },
//     anchor_chain_category: { type: DataTypes.TEXT },
//     anchor_chain_caliber: { type: DataTypes.TEXT },
//     vessel_project: { type: DataTypes.TEXT },
//     first_inspection_date: { type: DataTypes.TEXT },
//     build_location: { type: DataTypes.TEXT },
//     design_length: { type: DataTypes.TEXT },
//     design_width: { type: DataTypes.TEXT },
//     freeboard_height: { type: DataTypes.TEXT },
//     lifting_capacity: { type: DataTypes.TEXT },
//     transverse_bulkheads_count: { type: DataTypes.TEXT },
//     longitudinal_bulkheads_count: { type: DataTypes.TEXT },
//     passenger_capacity: { type: DataTypes.TEXT },
//     crew_size: { type: DataTypes.TEXT },
//     org_group: { type: DataTypes.TEXT },
//     total_tank_volume: { type: DataTypes.TEXT },
//     boom_1_capacity: { type: DataTypes.TEXT },
//     boom_2_capacity: { type: DataTypes.TEXT },
//     boom_3_capacity: { type: DataTypes.TEXT },
//     hull_material: { type: DataTypes.TEXT },
//     superstructure_material: { type: DataTypes.TEXT },
//     propulsion_model: { type: DataTypes.TEXT },
//     total_electric_generators: { type: DataTypes.TEXT },
//     total_generator_power: { type: DataTypes.TEXT },
//     factory_location: { type: DataTypes.TEXT },
//     build_city: { type: DataTypes.TEXT },
//     refit_factory: { type: DataTypes.TEXT },
//     refit_city: { type: DataTypes.TEXT },
//     laid_down_date: { type: DataTypes.TEXT },
//     launch_date: { type: DataTypes.TEXT },
//     completion_date: { type: DataTypes.TEXT },
//     owner: { type: DataTypes.TEXT },
//     operator: { type: DataTypes.TEXT },
//     registration: { type: DataTypes.TEXT },
//     board_number: { type: DataTypes.TEXT },
//     mmsi: { type: DataTypes.TEXT },
//     current_status: { type: DataTypes.TEXT },
//     notes: { type: DataTypes.TEXT },
//     propulsion_count: { type: DataTypes.TEXT },
//     ged_count: { type: DataTypes.TEXT },
//     total_ged_power: { type: DataTypes.TEXT },
//     cargo_hold_count: { type: DataTypes.TEXT },
//     cargo_hold_volume: { type: DataTypes.TEXT },
//     container_count: { type: DataTypes.TEXT },
//     container_type: { type: DataTypes.TEXT },
//     source: { type: DataTypes.TEXT }
// }, {
//     tableName: 'MarinFleet',
//     timestamps: false
// });


const User = sequelizer.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.TEXT, unique: true, allowNull: false },
    password: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'User',
    timestamps: false
});

const Role = sequelizer.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'Role',
    timestamps: false
});

const UserRole = sequelizer.define('UserRole', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
        type: DataTypes.INTEGER,
        references: { model: User, key: 'id' },
        onDelete: 'CASCADE'
    },
    role_id: {
        type: DataTypes.INTEGER,
        references: { model: Role, key: 'id' },
        onDelete: 'CASCADE'
    },
}, {
    tableName: 'UserRole',
    timestamps: false
});

const UserLog = sequelizer.define('UserLog', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.TEXT, allowNull: false },
    login_time: { type: DataTypes.DATE, allowNull: false },
    logout_time: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'UserLog',
    timestamps: false
});

const ChangedDate = sequelizer.define('ChangedDate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    RegistryNumber: { type: DataTypes.TEXT, allowNull: false },
    username: { type: DataTypes.TEXT, allowNull: false },
    chenged_time: { type: DataTypes.DATE, allowNull: false },
    PurchaseName: { type: DataTypes.TEXT, allowNull: true },
    Role: { type: DataTypes.TEXT, allowNull: true },
    Type: { type: DataTypes.TEXT, allowNull: true },
}, {
    tableName: 'ChangedDate',
    timestamps: false
});

// Определение связей между моделями
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

module.exports = {
    MarinFleet,
    User,
    Role,
    UserRole,
    UserLog,
    ChangedDate,
    sequelizer
};


