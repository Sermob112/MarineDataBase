const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Определение моделей
// const MarinFleet = sequelize.define('MarinFleet', {
//     reg_no: { type: DataTypes.STRING, allowNull: false },
//     name: { type: DataTypes.STRING, allowNull: false },
//     building_no: { type: DataTypes.STRING, allowNull: false },
//     project: { type: DataTypes.STRING, allowNull: false },
//     type_and_purpose: { type: DataTypes.STRING, allowNull: false },
//     build_date: { type: DataTypes.DATEONLY, allowNull: false },
//     build_place: { type: DataTypes.STRING, allowNull: false },
//     class_formula: { type: DataTypes.STRING, allowNull: false },
//     overall_length: { type: DataTypes.FLOAT, allowNull: false },
//     structural_length: { type: DataTypes.FLOAT, allowNull: false },
//     overall_width: { type: DataTypes.FLOAT, allowNull: false },
//     structural_width: { type: DataTypes.FLOAT, allowNull: false },
//     freeboard: { type: DataTypes.FLOAT, allowNull: false },
//     board_height: { type: DataTypes.FLOAT, allowNull: false },
//     gross_tonnage: { type: DataTypes.FLOAT, allowNull: false },
//     net_tonnage: { type: DataTypes.FLOAT, allowNull: false },
//     deadweight: { type: DataTypes.FLOAT, allowNull: false },
//     displacement: { type: DataTypes.FLOAT, allowNull: false },
//     lifting_capacity: { type: DataTypes.FLOAT, allowNull: false },
//     transverse_bulkheads: { type: DataTypes.INTEGER, allowNull: false },
//     longitudinal_bulkheads: { type: DataTypes.INTEGER, allowNull: false },
//     passenger_capacity: { type: DataTypes.INTEGER, allowNull: false },
//     crew: { type: DataTypes.INTEGER, allowNull: false },
//     organization_group: { type: DataTypes.STRING, allowNull: false },
//     cargo_tanks: { type: DataTypes.INTEGER, allowNull: false },
//     total_tank_volume: { type: DataTypes.FLOAT, allowNull: false },
//     crane_capacity_1: { type: DataTypes.FLOAT, allowNull: false },
//     crane_capacity_2: { type: DataTypes.FLOAT, allowNull: false },
//     crane_capacity_3: { type: DataTypes.FLOAT, allowNull: false },
//     hull_material: { type: DataTypes.STRING, allowNull: false },
//     superstructure_material: { type: DataTypes.STRING, allowNull: false },
//     main_engine_type: { type: DataTypes.STRING, allowNull: false },
//     main_engine_brand: { type: DataTypes.STRING, allowNull: false },
//     main_engine_power: { type: DataTypes.FLOAT, allowNull: false },
//     main_engine_count: { type: DataTypes.INTEGER, allowNull: false },
//     total_engine_power: { type: DataTypes.FLOAT, allowNull: false },
//     total_ged_power: { type: DataTypes.FLOAT, allowNull: false },
//     ged_power: { type: DataTypes.FLOAT, allowNull: false },
//     ges_power: { type: DataTypes.FLOAT, allowNull: false },
// }, {
//     tableName: 'MarinFleet',
//     timestamps: false
// });
const MarinFleet = sequelize.define('MarinFleet', {
    reg_no: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    vessel_name: { type: DataTypes.STRING },
    reg_number: { type: DataTypes.STRING },
    imo_number: { type: DataTypes.STRING },
    callsign: { type: DataTypes.STRING },
    port_of_registry: { type: DataTypes.STRING },
    flag: { type: DataTypes.STRING },
    class_symbol: { type: DataTypes.STRING },
    main_type: { type: DataTypes.STRING },
    build_date: { type: DataTypes.STRING },
    build_country: { type: DataTypes.STRING },
    build_number: { type: DataTypes.STRING },
    gross_tonnage: { type: DataTypes.STRING },
    net_tonnage: { type: DataTypes.STRING },
    deadweight: { type: DataTypes.STRING },
    displacement: { type: DataTypes.STRING },
    overall_length: { type: DataTypes.STRING },
    width: { type: DataTypes.STRING },
    height: { type: DataTypes.STRING },
    draft: { type: DataTypes.STRING },
    speed: { type: DataTypes.STRING },
    propulsion_type: { type: DataTypes.STRING },
    propeller_count: { type: DataTypes.STRING },
    generator_power: { type: DataTypes.STRING },
    main_boilers: { type: DataTypes.STRING },
    refrigeration_system: { type: DataTypes.STRING },
    working_temperature: { type: DataTypes.STRING },
    refrigerants: { type: DataTypes.STRING },
    cargo_holds: { type: DataTypes.STRING },
    tanks: { type: DataTypes.STRING },
    deck_count: { type: DataTypes.STRING },
    bulkheads_count: { type: DataTypes.STRING },
    bed_passenger_count: { type: DataTypes.STRING },
    non_bed_passenger_count: { type: DataTypes.STRING },
    special_personnel: { type: DataTypes.STRING },
    cargo_hatches: { type: DataTypes.STRING },
    booms: { type: DataTypes.STRING },
    cranes: { type: DataTypes.STRING },
    fuel_reserves: { type: DataTypes.STRING },
    fuel_types: { type: DataTypes.STRING },
    ballast: { type: DataTypes.STRING },
    heaters: { type: DataTypes.STRING },
    supply_characteristics: { type: DataTypes.STRING },
    anchor_chain_category: { type: DataTypes.STRING },
    anchor_chain_caliber: { type: DataTypes.STRING },
    vessel_project: { type: DataTypes.STRING },
    first_inspection_date: { type: DataTypes.STRING },
    build_location: { type: DataTypes.STRING },
    design_length: { type: DataTypes.STRING },
    design_width: { type: DataTypes.STRING },
    freeboard_height: { type: DataTypes.STRING },
    lifting_capacity: { type: DataTypes.STRING },
    transverse_bulkheads_count: { type: DataTypes.STRING },
    longitudinal_bulkheads_count: { type: DataTypes.STRING },
    passenger_capacity: { type: DataTypes.STRING },
    crew_size: { type: DataTypes.STRING },
    tank_count: { type: DataTypes.STRING },
    total_tank_volume: { type: DataTypes.STRING },
    boom_1_capacity: { type: DataTypes.STRING },
    boom_2_capacity: { type: DataTypes.STRING },
    boom_3_capacity: { type: DataTypes.STRING },
    hull_material: { type: DataTypes.STRING },
    superstructure_material: { type: DataTypes.STRING },
    propulsion_model: { type: DataTypes.STRING },
    total_electric_generators: { type: DataTypes.STRING },
    total_generator_power: { type: DataTypes.STRING },
    factory_location: { type: DataTypes.STRING },
    build_city: { type: DataTypes.STRING },
    refit_factory: { type: DataTypes.STRING },
    refit_city: { type: DataTypes.STRING },
    laid_down_date: { type: DataTypes.STRING },
    launch_date: { type: DataTypes.STRING },
    completion_date: { type: DataTypes.STRING },
    owner: { type: DataTypes.STRING },
    operator: { type: DataTypes.STRING },
    registration: { type: DataTypes.STRING },
    board_number: { type: DataTypes.STRING },
    mmsi: { type: DataTypes.STRING },
    current_status: { type: DataTypes.STRING },
    notes: { type: DataTypes.STRING },
    propulsion_count: { type: DataTypes.STRING },
    propulsion_type: { type: DataTypes.STRING },
    ged_count: { type: DataTypes.STRING },
    total_ged_power: { type: DataTypes.STRING },
    cargo_hold_count: { type: DataTypes.STRING },
    cargo_hold_volume: { type: DataTypes.STRING },
    container_count: { type: DataTypes.STRING },
    container_type: { type: DataTypes.STRING },
    source: { type: DataTypes.STRING }

}, {
        tableName: 'MarinFleet',
        timestamps: false
    });

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'User',
    timestamps: false
});

const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'Role',
    timestamps: false
});

const UserRole = sequelize.define('UserRole', {
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

const UserLog = sequelize.define('UserLog', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false },
    login_time: { type: DataTypes.DATE, allowNull: false },
    logout_time: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'UserLog',
    timestamps: false
});

const ChangedDate = sequelize.define('ChangedDate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    RegistryNumber: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false },
    chenged_time: { type: DataTypes.DATE, allowNull: false },
    PurchaseName: { type: DataTypes.STRING, allowNull: true },
    Role: { type: DataTypes.STRING, allowNull: true },
    Type: { type: DataTypes.STRING, allowNull: true },
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
    sequelize
};
