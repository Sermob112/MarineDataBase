const { ipcMain } = require('electron');
const models = require('../database/models');      // <-- контейнер
const { Op, col } = require('sequelize');
const { importVesselDataNew } = require('./CsvReaderShipDataByArtem');

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
    ipcMain.handle('clear-database', this.clearMarinFleet.bind(this));
    ipcMain.handle('get-index-facets', this.getIndexFacets.bind(this));
    ipcMain.handle('get-route-page', this.getRoutePage.bind(this));
    ipcMain.handle('import-vessel-data', async (_event, filePath) => {
      try {
        const message = await importVesselDataNew(filePath);
        return { success: true, message };
      } catch (error) {
        console.error('Error importing vessel data:', error);
        return { success: false, error: error };
      }
    });
  }

  // Получение всех данных из базы
  async getShipData(_event, { offset = 0, batchSize = 50, sortField = 'id', ascending = true }) {
    try {
      const ships = await models.MarinFleet.findAll({
        offset,
        limit: batchSize,
        order: [[sortField, ascending ? 'ASC' : 'DESC']]
      });
      return ships.map(ship => ship.toJSON());
    } catch (error) {
      console.error('Ошибка при получении данных судов:', error);
      throw error;
    }
  }

  // Добавление нового судна
  async addShip(_event, shipData) {
    try {
      const newShip = await models.MarinFleet.create(shipData);
      return newShip.toJSON();
    } catch (error) {
      console.error('Ошибка при добавлении судна:', error);
      throw error;
    }
  }

  async clearMarinFleet() {
    try {
      await models.MarinFleet.destroy({ truncate: true });
      return { success: true, message: 'База данных успешно очищена' };
    } catch (error) {
      console.error('Ошибка при очистке базы данных:', error);
      return { success: false, message: 'Произошла ошибка при очистке базы данных' };
    }
  }

  // Удаление судна по ID
  async deleteShip(_event, shipId) {
    try {
      const ship = await models.MarinFleet.findByPk(shipId);
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
  async editShip(_event, { id, ...updatedData }) {
    try {
      const ship = await models.MarinFleet.findByPk(id);
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
      const ships = await models.MarinFleet.findAll();
      return {
        selectedShip: this.selectedShip.toJSON(),
        totalShips: ships.length,
      };
    } else {
      throw new Error('Судно не выбрано');
    }
  }

  async loadShipDetails(_event, shipId) {
    this.selectedShip = await models.MarinFleet.findByPk(shipId);
  }

  async searchShips(
    _event,
    { query, offset, batchSize, sortField = 'id', ascending = true }
  ) {
    try {
      const totalRecords = await models.MarinFleet.count();

      const whereCondition = query
        ? {
            [Op.or]: [
              { reg_number: { [Op.like]: `%${query}%` } },
              { main_type: { [Op.like]: `%${query}%` } },
              { imo_number: { [Op.like]: `%${query}%` } },
              { refit_factory: { [Op.like]: `%${query}%` } },
              { vessel_project: { [Op.like]: `%${query}%` } },
            ],
          }
        : {};

      const filteredCount = await models.MarinFleet.count({ where: whereCondition });

      const ships = await models.MarinFleet.findAll({
        where: whereCondition,
        offset,
        limit: batchSize,
        order: [[sortField, ascending ? 'ASC' : 'DESC']],
      });

      return {
        totalRecords,
        filteredCount,
        ships: ships.map(ship => ship.toJSON()),
      };
    } catch (error) {
      console.error('Ошибка при поиске судов:', error);
      throw error;
    }
  }



async bucketByDataSource(dsRaw) {
  const L = String(dsRaw || '').toLowerCase();
  if (!L) return 'riverSea';              // по умолчанию
  if (L.includes('реч') || L.includes('river')) return 'river';
  if (L.includes('мор') || L.includes('sea'))   return 'sea';
  return 'riverSea';
}


async getIndexFacets() {
  try {
    const { MarinFleet } = require('../database/models');

    const whereRiver = { [Op.or]: [
      { data_source: { [Op.iLike]: '%реч%' } },
      { data_source: { [Op.iLike]: '%river%' } },
    ]};

    const whereSea = { [Op.or]: [
      { data_source: { [Op.iLike]: '%мор%' } },
      { data_source: { [Op.iLike]: '%sea%' } },
    ]};

    const whereNotSeaNotRiver = { [Op.and]: [
      { data_source: { [Op.notILike]: '%реч%' } },
      { data_source: { [Op.notILike]: '%river%' } },
      { data_source: { [Op.notILike]: '%мор%' } },
      { data_source: { [Op.notILike]: '%sea%' } },
    ]};

    // riverSea = НЕ содержит ни "реч"/"river", ни "мор"/"sea" ИЛИ data_source IS NULL
    const whereRiverSea = { [Op.or]: [
      { data_source: { [Op.is]: null } },
      whereNotSeaNotRiver
    ]};

    const [seaCount, riverCount, riverSeaCount] = await Promise.all([
      MarinFleet.count({ where: whereSea }),
      MarinFleet.count({ where: whereRiver }),
      MarinFleet.count({ where: whereRiverSea }),
    ]);

    return {
      route: {
        sea:      { count: seaCount },
        river:    { count: riverCount },
        riverSea: { count: riverSeaCount },
      },
      cargoBase: {},                   // заполним позже из БД, сейчас фронт использует статический набор
      movementTypes: ['Самоходные','Несамоходные','Стоечные'],
      okpd2: [],
      eskd: [],
    };
  } catch (err) {
    console.error('getIndexFacets error:', err);
    throw err;
  }
}


// Постраничная выдача судов для корзины "sea|river|riverSea"
async getRoutePage(_event, { bucket, offset = 0, limit = 200 }) {
  try {
    const { MarinFleet, sequelize } = require('../database/models');

    const whereRiver = { [Op.or]: [
      { data_source: { [Op.iLike]: '%реч%' } },
      { data_source: { [Op.iLike]: '%river%' } },
    ]};

    const whereSea = { [Op.or]: [
      { data_source: { [Op.iLike]: '%мор%' } },
      { data_source: { [Op.iLike]: '%sea%' } },
    ]};

    const whereNotSeaNotRiver = { [Op.and]: [
      { data_source: { [Op.notILike]: '%реч%' } },
      { data_source: { [Op.notILike]: '%river%' } },
      { data_source: { [Op.notILike]: '%мор%' } },
      { data_source: { [Op.notILike]: '%sea%' } },
    ]};
    const whereRiverSea = { [Op.or]: [
      { data_source: { [Op.is]: null } },
      whereNotSeaNotRiver
    ]};

    let where = whereRiverSea;
    if (bucket === 'sea') where = whereSea;
    if (bucket === 'river') where = whereRiver;

    const rows = await MarinFleet.findAll({
      attributes: [
        'id',
        [col('imo_number'),   'imo'],
        [col('vessel_name'),  'name'],
        [col('reg_number'),   'reg'],
      ],
      where,
      offset,
      limit,
      order: [['id', 'ASC']],
      raw: true
    });

    return {
      items: rows.map(r => ({
        id: r.id,
        imo: r.imo || '—',
        name: r.name || '—',
        reg: r.reg || '—',
      })),
      nextOffset: offset + rows.length
    };
  } catch (err) {
    console.error('get-route-page error:', err);
    throw err;
  }
}

  
}

module.exports = ShipBaseBack;
