const { DataTypes,Sequelize } = require('sequelize');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');


    
async function initializeDatabase() {
    const sequelize = new Sequelize('marinebase', 'postgres', 'sa', {
        host: 'localhost',
        dialect: 'postgres',
        port: 5432
    });
    
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
    
    const systemDb = new Sequelize('postgres', 'postgres', 'sa', {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        });   
    
    await systemDb.query('CREATE DATABASE marinebase');
    console.log('Database marinebase created successfully.');
    
    try {
        await sequelize.sync({ force: true });

        const adminUser = await User.create({ username: 'ad', password: '1' });
        const readactorUser = await User.create({ username: 're', password: '2' });
        const regularUser = await User.create({ username: 'us', password: '3' });
        const gostUser = await User.create({ username: 'go', password: '4' });

        const adminRole = await Role.create({ name: 'Администратор' });
        const readactorRole = await Role.create({ name: 'Редактор' });
        const userRole = await Role.create({ name: 'Пользователь' });
        const gostRole = await Role.create({ name: 'Гость' });

        await adminUser.addRole(adminRole.id);
        await readactorUser.addRole(readactorRole.id);
        await regularUser.addRole(userRole.id);
        await gostUser.addRole(gostRole.id);

        console.log('Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        return false;
    }
}

// Функция для установки PostgreSQL
function isPostgreSQLInstalled() {
    return new Promise((resolve, reject) => {
        exec('psql --version', (error, stdout, stderr) => {
            if (error) {
                // Если команда не выполнена, PostgreSQL, вероятно, не установлен
                resolve(false);
            } else {
                // Если команда успешно выполнена, PostgreSQL уже установлен
                resolve(true);
            }
        });
    });
}

// Функция для установки PostgreSQL
function installPostgreSQL() {
    return new Promise((resolve, reject) => {
        console.log('Installing PostgreSQL...');
        
        // Путь к установщику
        const installerPath = path.resolve('installPG.exe');

        // Аргументы для установки PostgreSQL в тихом режиме
        const installCommand = `"${installerPath}" --mode unattended --superpassword "sa" --datadir "C:\\PostgreSQL\\data"`;

        exec(installCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error installing PostgreSQL: ${error.message}`);
                return reject(error);
            }
            console.log('PostgreSQL installed successfully.');
            resolve();
        });
    });
}

// // Основной процесс установки
async function runInstaller() {
    try {
        const isInstalled = await isPostgreSQLInstalled();
        if (isInstalled) {
            console.log('PostgreSQL is already installed.');
        } else {
            await installPostgreSQL();
        }

        // Продолжаем процесс настройки базы данных
        await initializeDatabase();
        console.log('Installation and setup completed successfully.');
    } catch (error) {
        console.error('Installation failed:', error);
    }

    // Ожидание нажатия Enter
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Press Enter to exit...', () => { rl.close(); });
}

// Обработка неожиданных ошибок
process.on('uncaughtException', (err) => {
    fs.writeFileSync('error_log.txt', err.stack);
    console.error('An error occurred. Check error_log.txt for details.');
});


runInstaller();
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Press Enter to exit...', () => { rl.close(); });