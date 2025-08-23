const { DataTypes } = require('sequelize');

let MarinFleet, User, Role, UserRole, UserLog, ChangedDate;


function initModels(sequelize) {
    
    MarinFleet = sequelize.define('MarinFleet', {
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

 User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.TEXT, unique: true, allowNull: false },
    password: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'User',
    timestamps: false
});

 Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'Role',
    timestamps: false
});

 UserRole = sequelize.define('UserRole', {
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

 UserLog = sequelize.define('UserLog', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.TEXT, allowNull: false },
    login_time: { type: DataTypes.DATE, allowNull: false },
    logout_time: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'UserLog',
    timestamps: false
});

 ChangedDate = sequelize.define('ChangedDate', {
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

module.exports.MarinFleet = MarinFleet;
module.exports.User = User;
module.exports.Role = Role;
module.exports.UserRole = UserRole;
module.exports.UserLog = UserLog;
module.exports.ChangedDate = ChangedDate;

return module.exports;

}
Object.defineProperties(module.exports, {
    MarinFleet: { enumerable: true, get: () => MarinFleet },
    User:       { enumerable: true, get: () => User },
    Role:       { enumerable: true, get: () => Role },
    UserRole:   { enumerable: true, get: () => UserRole },
    UserLog:    { enumerable: true, get: () => UserLog },
    ChangedDate:{ enumerable: true, get: () => ChangedDate },
    initModels: { value: initModels }
  });
