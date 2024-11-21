const { ipcMain } = require('electron');
const { MarinFleet } = require('../models');
const { Op } = require('sequelize');
class ShipBaseBack {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    ipcMain.handle('search-ship', this.searchShips.bind(this));
    ipcMain.handle('get-ship-data', this.getShipData.bind(this));
    ipcMain.handle('add-ship', this.addShip.bind(this));
    ipcMain.handle('delete-ship', this.deleteShip.bind(this));
    ipcMain.handle('edit-ship', this.editShip.bind(this));
    ipcMain.handle('get-selected-ship', this.getSelectedShip.bind(this));
    ipcMain.handle('load-ship-details', this.loadShipDetails.bind(this));
  }

  // Получение всех данных из базы
  async getShipData(event, { offset = 0, batchSize = 50 }) {
    try {
      // Параметризуем запрос
      const ships = await MarinFleet.findAll({
        offset, // Смещение
        limit: batchSize, // Количество записей
        order: [['id', 'ASC']] // Упорядочиваем по id
      });
      return ships.map(ship => ship.toJSON());
    } catch (error) {
      console.error('Ошибка при получении данных судов:', error);
      throw error;
    }
  }

  // Добавление нового судна
  async addShip(event, shipData) {
    try {
      const newShip = await MarinFleet.create(shipData);
      return newShip.toJSON();
    } catch (error) {
      console.error('Ошибка при добавлении судна:', error);
      throw error;
    }
  }

  // Удаление судна по ID
  async deleteShip(event, shipId) {
    try {
      const ship = await MarinFleet.findByPk(shipId);
      if (ship) {
        await ship.destroy();
        return { success: true };
      } else {
        return { success: false, message: 'Судно не найдено' };
      }
    } catch (error) {
      console.error('Ошибка при удалении судна:', error);
      return { success: false, message: 'Произошла ошибка при удалении судна' };
    }
  }

  // Редактирование судна
  async editShip(event, { id, ...updatedData }) {
    try {
      const ship = await MarinFleet.findByPk(id);
      if (ship) {
        await ship.update(updatedData);
        return ship.toJSON();
      } else {
        return { success: false, message: 'Судно не найдено' };
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных судна:', error);
      throw error;
    }
  }
  async getSelectedShip() {
    if (this.selectedShip) {
      const ships = await MarinFleet.findAll();
      return {
        selectedShip: this.selectedShip.toJSON(),
        totalShips: ships.length,
      };
    } else {
      throw new Error('Судно не выбрано');
    }
  }
  

  async loadShipDetails(event, shipId) {
    this.selectedShip = await MarinFleet.findByPk(shipId);
    
  }

  async searchShips(event, query) {
    try {
      // Общее количество записей в базе
      const totalRecords = await MarinFleet.count();
  
      // Условие для поиска
      const whereCondition = query
        ? { vessel_name: { [Op.like]: `%${query}%` } }
        : {};
  
      // Количество записей, соответствующих запросу
      const filteredCount = await MarinFleet.count({ where: whereCondition });
  
      // Найденные записи
      const ships = await MarinFleet.findAll({ where: whereCondition });
  
      return {
        totalRecords,       // Общее количество записей в базе
        filteredCount,      // Количество записей, соответствующих запросу
        ships: ships.map(ship => ship.toJSON()), // Найденные записи
      };
    } catch (error) {
      console.error('Ошибка при поиске судов:', error);
      throw error;
    }
  }
  
}

module.exports = ShipBaseBack;
