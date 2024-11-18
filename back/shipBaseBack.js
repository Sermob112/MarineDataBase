const { ipcMain } = require('electron');
const { MarinFleet } = require('../models');

class ShipBaseBack {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    ipcMain.handle('get-ship-data', this.getShipData.bind(this));
    ipcMain.handle('add-ship', this.addShip.bind(this));
    ipcMain.handle('delete-ship', this.deleteShip.bind(this));
    ipcMain.handle('edit-ship', this.editShip.bind(this));
    ipcMain.handle('get-selected-ship', this.getSelectedShip.bind(this));
    ipcMain.handle('load-ship-details', this.loadShipDetails.bind(this));
  }

  // Получение всех данных из базы
  async getShipData() {
    try {
      const ships = await MarinFleet.findAll();
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
      return this.selectedShip.toJSON();
    } else {
      throw new Error('Судно не выбрано');
    }
  }

  async loadShipDetails(event, shipId) {
    this.selectedShip = await MarinFleet.findByPk(shipId);
  }
}

module.exports = ShipBaseBack;
