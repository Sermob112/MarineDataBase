const { sequelize, MarinFleet, User, Role, UserRole, UserLog, ChangedDate } = require('./models');
const { Sequelize } = require('sequelize');
const systemDb = new Sequelize('postgres', 'postgres', 'sa', {
host: 'localhost',
port: 5432,
dialect: 'postgres',
});

async function initializeDatabase() {
 
   
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
module.exports = { initializeDatabase };
initializeDatabase();
