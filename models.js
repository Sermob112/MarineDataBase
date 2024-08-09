const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Определение моделей
const MarinFleet = sequelize.define('MarinFleet', {
    reg_no: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    building_no: { type: DataTypes.STRING, allowNull: false },
    project: { type: DataTypes.STRING, allowNull: false },
    type_and_purpose: { type: DataTypes.STRING, allowNull: false },
    build_date: { type: DataTypes.DATEONLY, allowNull: false },
    build_place: { type: DataTypes.STRING, allowNull: false },
    class_formula: { type: DataTypes.STRING, allowNull: false },
    overall_length: { type: DataTypes.FLOAT, allowNull: false },
    structural_length: { type: DataTypes.FLOAT, allowNull: false },
    overall_width: { type: DataTypes.FLOAT, allowNull: false },
    structural_width: { type: DataTypes.FLOAT, allowNull: false },
    freeboard: { type: DataTypes.FLOAT, allowNull: false },
    board_height: { type: DataTypes.FLOAT, allowNull: false },
    gross_tonnage: { type: DataTypes.FLOAT, allowNull: false },
    net_tonnage: { type: DataTypes.FLOAT, allowNull: false },
    deadweight: { type: DataTypes.FLOAT, allowNull: false },
    displacement: { type: DataTypes.FLOAT, allowNull: false },
    lifting_capacity: { type: DataTypes.FLOAT, allowNull: false },
    transverse_bulkheads: { type: DataTypes.INTEGER, allowNull: false },
    longitudinal_bulkheads: { type: DataTypes.INTEGER, allowNull: false },
    passenger_capacity: { type: DataTypes.INTEGER, allowNull: false },
    crew: { type: DataTypes.INTEGER, allowNull: false },
    organization_group: { type: DataTypes.STRING, allowNull: false },
    cargo_tanks: { type: DataTypes.INTEGER, allowNull: false },
    total_tank_volume: { type: DataTypes.FLOAT, allowNull: false },
    crane_capacity_1: { type: DataTypes.FLOAT, allowNull: false },
    crane_capacity_2: { type: DataTypes.FLOAT, allowNull: false },
    crane_capacity_3: { type: DataTypes.FLOAT, allowNull: false },
    hull_material: { type: DataTypes.STRING, allowNull: false },
    superstructure_material: { type: DataTypes.STRING, allowNull: false },
    main_engine_type: { type: DataTypes.STRING, allowNull: false },
    main_engine_brand: { type: DataTypes.STRING, allowNull: false },
    main_engine_power: { type: DataTypes.FLOAT, allowNull: false },
    main_engine_count: { type: DataTypes.INTEGER, allowNull: false },
    total_engine_power: { type: DataTypes.FLOAT, allowNull: false },
    total_ged_power: { type: DataTypes.FLOAT, allowNull: false },
    ged_power: { type: DataTypes.FLOAT, allowNull: false },
    ges_power: { type: DataTypes.FLOAT, allowNull: false },
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
