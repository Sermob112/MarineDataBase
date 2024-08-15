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

      const userList = users.map(user => user.toJSON());
      return userList;
    } catch (error) {
      console.error('Ошибка при получении данных пользователей:', error);
      throw error;
    }
  });

  ipcMain.handle('add-user', async (event, userData) => {
    try {
      const { username, password, roles } = userData;

      // Создание нового пользователя
      const newUser = await User.create({ username, password });

      // Назначение ролей
      if (roles && roles.length > 0) {
        // Ищем нужные роли по их именам
        const roleInstances = await Role.findAll({
          where: {
            name: roles,
          },
        });

        // Назначаем роли новому пользователю
        await newUser.addRoles(roleInstances);
      }

      return newUser;
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
      throw error;
    }
  });
  ipcMain.handle('delete-user', async (event, userId) => {
    try {
      // Ищем пользователя по ID
      const user = await User.findByPk(userId);
      if (user) {
        await user.destroy(); // Удаляем пользователя
        return { success: true };
      } else {
        return { success: false, message: 'Пользователь не найден' };
      }
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      return { success: false, message: 'Произошла ошибка при удалении пользователя' };
    }
  });

  ipcMain.handle('edit-user', async (event, { userId, username, password, roles }) => {
    try {
        // Ищем пользователя по ID
        const user = await User.findByPk(userId);
        if (user) {
            // Обновляем данные пользователя
            user.username = username;
            user.password = password;
            await user.save();

            // Обновляем роли
            if (roles && roles.length > 0) {
                const roleInstances = await Role.findAll({
                    where: { name: roles }
                });
                await user.setRoles(roleInstances); // Обновляем роли пользователя
            }

            return { success: true };
        } else {
            return { success: false, message: 'Пользователь не найден' };
        }
    } catch (error) {
        console.error('Ошибка при редактировании пользователя:', error);
        return { success: false, message: 'Произошла ошибка при редактировании пользователя' };
    }
});
}

module.exports = { setupAdminRoutes };
