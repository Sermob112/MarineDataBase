const { ipcMain } = require('electron');
const { User, Role, UserLog } = require('./models');

class AdminRoutes {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    ipcMain.handle('get-users-with-roles', this.getUsersWithRoles.bind(this));
    ipcMain.handle('add-user', this.addUser.bind(this));
    ipcMain.handle('delete-user', this.deleteUser.bind(this));
    ipcMain.handle('edit-user', this.editUser.bind(this));
    ipcMain.handle('get-user-logs', this.getUserLogs.bind(this));
  }

  async getUsersWithRoles() {
    try {
      const users = await User.findAll({
        include: {
          model: Role,
          through: { attributes: [] },
        },
      });
      return users.map(user => user.toJSON());
    } catch (error) {
      console.error('Ошибка при получении данных пользователей:', error);
      throw error;
    }
  }

  async addUser(event, userData) {
    try {
      const { username, password, roles } = userData;
      const newUser = await User.create({ username, password });

      if (roles && roles.length > 0) {
        const roleInstances = await Role.findAll({
          where: { name: roles },
        });
        await newUser.addRoles(roleInstances);
      }

      return newUser;
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
      throw error;
    }
  }

  async deleteUser(event, userId) {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        await user.destroy();
        return { success: true };
      } else {
        return { success: false, message: 'Пользователь не найден' };
      }
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      return { success: false, message: 'Произошла ошибка при удалении пользователя' };
    }
  }

  async editUser(event, { userId, username, password, roles }) {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        user.username = username;
        user.password = password;
        await user.save();

        if (roles && roles.length > 0) {
          const roleInstances = await Role.findAll({
            where: { name: roles },
          });
          await user.setRoles(roleInstances);
        }

        return { success: true };
      } else {
        return { success: false, message: 'Пользователь не найден' };
      }
    } catch (error) {
      console.error('Ошибка при редактировании пользователя:', error);
      return { success: false, message: 'Произошла ошибка при редактировании пользователя' };
    }
  }

  async getUserLogs() {
    try {
      const logs = await UserLog.findAll();
      return logs.map(log => log.toJSON());
    } catch (error) {
      console.error('Ошибка при получении журнала пользователей:', error);
      throw error;
    }
  }
}

module.exports = AdminRoutes;
