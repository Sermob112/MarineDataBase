const { ipcMain } = require('electron');
const { User, Role } = require('./models');

function setupAdminRoutes() {
  ipcMain.handle('get-users-with-roles', async () => {
    try {
      const users = await User.findAll({
        include: {
          model: Role,
          through: { attributes: [] },
        },
      });

      // Преобразуем объекты Sequelize в простые JSON-объекты
      const userList = users.map(user => user.toJSON());

      return userList;
    } catch (error) {
      console.error('Ошибка при получении данных пользователей:', error);
      throw error;
    }
  });
}
function AddUser() {
ipcMain.handle('add-user', async (event, userData) => {
    try {
      const { username, password } = userData;
      // Создание нового пользователя
      const newUser = await User.create({ username, password });
      return newUser; // Возвращаем данные нового пользователя
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
      throw error;
    }
  });
}
module.exports = { setupAdminRoutes,AddUser };
