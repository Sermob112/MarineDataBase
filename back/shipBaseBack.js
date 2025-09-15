const { ipcMain } = require('electron');
const { Op, col ,fn, where, literal} = require('sequelize');
const { importVesselDataNew } = require('./CsvReaderShipDataByArtem');

class ShipBaseBack {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    ipcMain.handle('search-ship',           this.searchShips.bind(this));
    ipcMain.handle('get-ship-data',         this.getShipData.bind(this));
    ipcMain.handle('add-ship',              this.addShip.bind(this));
    ipcMain.handle('delete-ship',           this.deleteShip.bind(this));
    ipcMain.handle('edit-ship',             this.editShip.bind(this));
    ipcMain.handle('clear-database',        this.clearMarinFleet.bind(this));
    ipcMain.handle('get-index-facets',      this.getIndexFacets.bind(this));
    ipcMain.handle('get-route-page',        this.getRoutePage.bind(this));
    ipcMain.handle('get-seafleet-types',    this.getSeaTypes.bind(this));
    ipcMain.handle('get-seafleet-by-type',  this.getSeaTypePage.bind(this));
    ipcMain.handle('get-movement-types',    this.getMovementTypes.bind(this));
    ipcMain.handle('get-movement-by-type',  this.getMovementTypePage.bind(this));
    ipcMain.handle('get-homeports',                 this.getHomeports.bind(this));
    ipcMain.handle('get-vessels-by-homeport',       this.getVesselsByHomeport.bind(this));
    ipcMain.handle('get-builder-countries',         this.getBuilderCountries.bind(this));
    ipcMain.handle('get-vessels-by-builder-country',this.getVesselsByBuilderCountry.bind(this));


    ipcMain.handle('import-vessel-data', async (_event, filePath) => {
      const { importVesselDataNew } = require('./CsvReaderShipDataByArtem');
      try {
        const message = await importVesselDataNew(filePath);
        return { success: true, message };
      } catch (error) {
        console.error('Error importing vessel data:', error);
        return { success: false, error };
      }
    });

    // Единый путь выбора судна/чтения выбранного
    ipcMain.handle('load-ship-details', this.loadShipDetails.bind(this));
    ipcMain.handle('get-selected-ship', this.getSelectedShip.bind(this));
  }

  async getShipData(_event, { offset = 0, batchSize = 50, sortField = 'id', ascending = true }) {
    try {
      const { MarinFleet } = require('../database/models');
      const rows = await MarinFleet.findAll({
        offset,
        limit: batchSize,
        order: [[sortField, ascending ? 'ASC' : 'DESC']],
        raw: true,
      });
      return rows;
    } catch (error) {
      console.error('Ошибка при получении данных судов:', error);
      throw error;
    }
  }

  async addShip(_event, shipData) {
    try {
      const { MarinFleet } = require('../database/models');
      const rec = await MarinFleet.create(shipData);
      return rec.toJSON();
    } catch (error) {
      console.error('Ошибка при добавлении судна:', error);
      throw error;
    }
  }

  async clearMarinFleet() {
    try {
      const { MarinFleet } = require('../database/models');
      await MarinFleet.destroy({ truncate: true });
      return { success: true, message: 'База данных успешно очищена' };
    } catch (error) {
      console.error('Ошибка при очистке базы данных:', error);
      return { success: false, message: 'Произошла ошибка при очистке базы данных' };
    }
  }

  async deleteShip(_event, shipId) {
    try {
      const { MarinFleet } = require('../database/models');
      const ship = await MarinFleet.findByPk(shipId);
      if (!ship) return { success: false, message: 'Судно не найдено' };
      await ship.destroy();
      return { success: true };
    } catch (error) {
      console.error('Ошибка при удалении судна:', error);
      return { success: false, message: 'Произошла ошибка при удалении судна' };
    }
  }

  async editShip(_event, { id, ...updatedData }) {
    try {
      const { MarinFleet } = require('../database/models');
      const ship = await MarinFleet.findByPk(id);
      if (!ship) return { success: false, message: 'Судно не найдено' };
      await ship.update(updatedData);
      return ship.toJSON();
    } catch (error) {
      console.error('Ошибка при обновлении данных судна:', error);
      throw error;
    }
  }

  async getSelectedShip() {
    const { MarinFleet, SeaFleet } = require('../database/models');
    const { id, model } = this.currentShip || {};
    if (!id) throw new Error('No ship selected');

    const Model = model === 'SeaFleet' ? SeaFleet : MarinFleet;
    const rec = await Model.findByPk(id, { raw: true });
    if (!rec) throw new Error('Ship not found');

    // вернём и модель — полезно для отладки на фронте
    return { selectedShip: rec, model };
  }

  currentShip = { id: null, model: null };

  async loadShipDetails(_event, payload) {
    let id, model;
    if (payload && typeof payload === 'object') {
      id    = Number(payload.id);
      model = payload.model === 'SeaFleet' ? 'SeaFleet' : 'MarinFleet';
    } else {
      id    = Number(payload);
      model = 'MarinFleet';
    }
    if (!id) throw new Error('Invalid ship id');
    this.currentShip = { id, model };
    return { ok: true };
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

// -----------------ТАБЛИЦЫ ПО Путевые условия----------------------------
async getIndexFacets() {
  try {
    const { MarinFleet, SeaFleet } = require('../database/models');

    const whereRiver = {
      [Op.or]: [
        { data_source: { [Op.iLike]: '%реч%' } },
        { data_source: { [Op.iLike]: '%river%' } },
      ],
    };

    const whereNotSeaNotRiver = {
      [Op.and]: [
        { data_source: { [Op.notILike]: '%реч%' } },
        { data_source: { [Op.notILike]: '%river%' } },
        { data_source: { [Op.notILike]: '%мор%' } },
        { data_source: { [Op.notILike]: '%sea%' } },
      ],
    };

    const whereRiverSea = {
      [Op.or]: [
        { class_formula: { [Op.iLike]: '%RSN%' } },
        { class_formula: { [Op.iLike]: '%РСН%' } },
        { class_formula: { [Op.iLike]: '%R2-RS%' } },
        { class_formula: { [Op.iLike]: '%R3-RS%' } },
        { class_formula: { [Op.iLike]: '%RIVER-SEA%' } },
        { class_formula: { [Op.iLike]: '%SEA-RIVER%' } },
        { class_formula: { [Op.iLike]: '%РЕКА-МОРЕ%' } },
        { data_source: { [Op.is]: null } },
        { data_source: { [Op.eq]: '' } },
      ],
    };

    const [seaCount, riverCount, riverSeaCount, otherCount] = await Promise.all([
      SeaFleet.count(),
      MarinFleet.count({ where: whereRiver }),
      MarinFleet.count({ where: whereRiverSea }),
      MarinFleet.count({ where: whereNotSeaNotRiver }),
    ]);

    return {
      route: {
        sea:      { count: seaCount },
        river:    { count: riverCount },
        riverSea: { count: riverSeaCount },
        other:    { count: otherCount },
      },
      cargoBase: {},
      movementTypes: ['Самоходные', 'Несамоходные', 'Стоечные'],
      okpd2: [],
      eskd: [],
    };
  } catch (err) {
    console.error('getIndexFacets error:', err);
    throw err;
  }
}

async getRoutePage(_event, { bucket, offset = 0, limit = 200 }) {
  try {
    const { MarinFleet, SeaFleet } = require('../database/models');

    if (bucket === 'sea') {
      const rows = await SeaFleet.findAll({
        attributes: [
          'id',
          [col('imo_number'),  'imo'],
          [col('vessel_name'), 'name'],
          [col('reg_number'),  'reg'],
        ],
        offset,
        limit,
        order: [['id', 'ASC']],
        raw: true,
      });
      return {
        items: rows.map(r => ({ id: r.id, imo: r.imo || '—', name: r.name || '—', reg: r.reg || '—' })),
        nextOffset: offset + rows.length,
      };
    }

    const whereRiver = {
      [Op.or]: [
        { data_source: { [Op.iLike]: '%реч%' } },
        { data_source: { [Op.iLike]: '%river%' } },
      ],
    };

    const whereNotSeaNotRiver = {
      [Op.and]: [
        { data_source: { [Op.notILike]: '%реч%' } },
        { data_source: { [Op.notILike]: '%river%' } },
        { data_source: { [Op.notILike]: '%мор%' } },
        { data_source: { [Op.notILike]: '%sea%' } },
      ],
    };

    const whereRiverSea = {
      [Op.or]: [
        { class_formula: { [Op.iLike]: '%RSN%' } },
        { class_formula: { [Op.iLike]: '%РСН%' } },
        { class_formula: { [Op.iLike]: '%R2-RS%' } },
        { class_formula: { [Op.iLike]: '%R3-RS%' } },
        { class_formula: { [Op.iLike]: '%RIVER-SEA%' } },
        { class_formula: { [Op.iLike]: '%SEA-RIVER%' } },
        { class_formula: { [Op.iLike]: '%РЕКА-МОРЕ%' } },
        { data_source: { [Op.is]: null } },
        { data_source: { [Op.eq]: '' } },
      ],
    };

    let where = whereRiverSea;
    if (bucket === 'river') where = whereRiver;
    if (bucket === 'other') where = whereNotSeaNotRiver;

    const rows = await MarinFleet.findAll({
      attributes: [
        'id',
        [col('imo_number'),  'imo'],
        [col('vessel_name'), 'name'],
        [col('reg_number'),  'reg'],
      ],
      where,
      offset,
      limit,
      order: [['id', 'ASC']],
      raw: true,
    });

    return {
      items: rows.map(r => ({ id: r.id, imo: r.imo || '—', name: r.name || '—', reg: r.reg || '—' })),
      nextOffset: offset + rows.length,
    };
  } catch (err) {
    console.error('get-route-page error:', err);
    throw err;
  }
}

 normalizeClassFormula(src) {
  if (!src) return '';
  const map = {
    'А':'A','В':'B','С':'C','Е':'E','Н':'H','К':'K','М':'M','О':'O','Р':'R','Т':'T','Х':'X','І':'I'
  };
  let s = String(src).toUpperCase();

  // унифицируем дефисы/тире
  s = s.replace(/[–—−‐-‒﹘﹣]/g, '-');

  // кириллица похожих букв → латиница
  s = s.replace(/[АВCСЕНКМОРОРТХІ]/g, ch => map[ch] || ch);

  // схлопываем пробелы
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

// Главная проверка «река-море» по формуле класса.
 isRiverSeaByClassFormula(src) {
  const s = normalizeClassFormula(src);

  // 1) Класс РС: R2-RSN, R2-RSN(4,5), R3-RSN (разные тире/пробелы)
  const RSN_RE = /\bR\s*[23]\s*[-–—]?\s*RSN(?:\s*\(\s*\d+(?:[.,]\d+)?\s*\))?\b/;

  // 2) Варианты UNECE/других регистров: A-R2-RS, R3-RS (исключаем R3-S — это не река-море)
  const RS_UNECE_RE = /\b(?:[AB]\s*[-–—]\s*)?R\s*[23]\s*[-–—]?\s*RS\b(?!N)(?!\s*[-–—]?\s*S)/;

  // 3) Текстовые пометки
  const WORDS_RE = /(РЕКА-?МОРЕ|RIVER-?SEA|SEA-?RIVER)/;

  // 4) Иногда встречается «R3,R3-RSN»
  const LIST_RE = /\bR3\s*,\s*R3\s*[-–—]?\s*RSN\b/;

  return RSN_RE.test(s) || RS_UNECE_RE.test(s) || WORDS_RE.test(s) || LIST_RE.test(s);
}

// Fallback: если формулы нет совсем — твоя старая эвристика по data_source
 isRiverSeaFallbackBySource(row) {
  const ds = (row?.data_source || '').toLowerCase();
  if (!ds) return true;
  return !/реч|river|мор|sea/i.test(ds);
}

// -----------------КОНЕЦ БЛОКА ТАБЛИЦЫ ПО Путевые условия----------------------------

// ----------------- БЛОК ТАБЛИЦЫ Грузовая база----------------------------

// Уникальные типы (main_type) из SeaFleet со счётчиками
async getSeaTypes() {
  try {
    const { SeaFleet, sequelize } = require('../database/models');
    const { Op, fn, col } = require('sequelize');

    const rows = await SeaFleet.findAll({
      attributes: [
        [col('main_type'), 'type'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        main_type: {
          [Op.not]: null,
          [Op.ne]: ''
        }
      },
      group: [col('main_type')],
      order: [[col('main_type'), 'ASC']],
      raw: true
    });

    // нормализуем (обрежем пробелы) и уберём дубликаты «вокруг пробелов»
    const map = new Map();
    for (const r of rows) {
      const t = String(r.type || '').replace(/\s+/g, ' ').trim();
      if (!t) continue;
      const cnt = Number(r.count || 0);
      map.set(t, (map.get(t) || 0) + cnt);
    }
    const out = Array.from(map.entries()).map(([type, count]) => ({ type, count }));
    // сортировка по-русски
    out.sort((a,b)=> a.type.localeCompare(b.type,'ru'));

    return out;
  } catch (err) {
    console.error('getSeaTypes error:', err);
    throw err;
  }
}

// Постранично выдаём суда SeaFleet по выбранному типу main_type
async getSeaTypePage(_event, { type, offset = 0, limit = 200 }) {
  try {
    const { SeaFleet } = require('../database/models');
    const { Op, col } = require('sequelize');

    const where = {
      main_type: { [Op.iLike]: String(type || '').trim() } // регистронезависимое совпадение
    };

    const rows = await SeaFleet.findAll({
      attributes: [
        'id',
        [col('imo_number'),  'imo'],
        [col('vessel_name'), 'name'],
        [col('reg_number'),  'reg'],
      ],
      where,
      offset,
      limit,
      order: [['id','ASC']],
      raw: true
    });

    return {
      items: rows.map(r => ({
        id: r.id,
        imo:  r.imo  || '—',
        name: r.name || '—',
        reg:  r.reg  || '—',
      })),
      nextOffset: offset + rows.length
    };
  } catch (err) {
    console.error('getSeaTypePage error:', err);
    throw err;
  }
}
// -----------------КОНЕЦ БЛОКА Грузовая база----------------------------
// -----------------Начало  БЛОКА Тип движения----------------------------
async  getMovementTypes() {
  try {
    const { SeaFleet } = require('../database/models');

    // Берём type + count, потом схлопываем дубликаты по normalized key
    const rows = await SeaFleet.findAll({
      attributes: [
        [col('propulsion_type'), 'type'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        propulsion_type: { [Op.not]: null, [Op.ne]: '' }
      },
      group: [col('propulsion_type')],
      order: [[col('propulsion_type'), 'ASC']],
      raw: true
    });

    const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
    const map = new Map(); // key = lower(norm), value = { type: firstOriginal, count: sum }
    for (const r of rows) {
      const t = norm(r.type);
      if (!t) continue;
      const key = t.toLowerCase();
      const prev = map.get(key);
      map.set(key, {
        type: prev?.type || t,               // отображаем «человеческий» вариант
        count: (prev?.count || 0) + (+r.count || 0)
      });
    }
    const out = Array.from(map.values()).sort((a,b)=> a.type.localeCompare(b.type,'ru'));
    return out; // [{type, count}]
  } catch (err) {
    console.error('getMovementTypes error:', err);
    throw err;
  }
}

// Постранично отдаём суда SeaFleet по точному (case-insensitive) значению propulsion_type
async  getMovementTypePage(_event, { type, offset = 0, limit = 200 }) {
  try {
    const { SeaFleet, sequelize } = require('../database/models');

    const selected = String(type || '').replace(/\s+/g, ' ').trim();
    if (!selected) return { items: [], nextOffset: offset };

    // TRIM(propulsion_type) ILIKE selected
    const rows = await SeaFleet.findAll({
      attributes: [
        'id',
        [col('imo_number'),  'imo'],
        [col('vessel_name'), 'name'],
        [col('reg_number'),  'reg'],
      ],
      where: where(fn('TRIM', col('propulsion_type')), { [Op.iLike]: selected }),
      offset,
      limit,
      order: [['id','ASC']],
      raw: true
    });

    return {
      items: rows.map(r => ({
        id:   r.id,
        imo:  r.imo  || '—',
        name: r.name || '—',
        reg:  r.reg  || '—',
      })),
      nextOffset: offset + rows.length
    };
  } catch (err) {
    console.error('getMovementTypePage error:', err);
    throw err;
  }
}


// -----------------КОНЕЦ  БЛОКА Тип движения----------------------------
 appendShipsToTable(ships) {
  const tbody = document.querySelector('#ship-table tbody');
  ships.forEach(ship => {
    // 1) если бэк вернул ship.model — используем его, иначе по умолчанию MarinFleet
    const model = ship.model || 'MarinFleet';
    const row = createShipRow(ship, model);
    tbody.appendChild(row);
  });
}
 createShipRow(ship, model = 'MarinFleet') {
  const row = document.createElement('tr');

  // 2) проставляем data-model на строку
  row.dataset.model = model;

  const idCell = createCell(ship.id);
  const nameCell = createCell(ship.main_type);
  const imoCell = createCell(ship.imo_number);
  const registryCell = createCell(ship.reg_number);
  const factoryCell = createCell(ship.refit_factory);   // для SeaFleet будет пусто — ок
  const projectCell = createCell(ship.vessel_project);   // для SeaFleet будет пусто — ок

  row.appendChild(idCell);
  row.appendChild(nameCell);
  row.appendChild(imoCell);
  row.appendChild(registryCell);
  row.appendChild(factoryCell);
  row.appendChild(projectCell);

  // 3) при клике передаём и id, и model
  row.addEventListener('click', () => viewDetails(ship.id, row.dataset.model));

  return row;
}

 viewDetails(shipId, model = 'MarinFleet') {
  // 4) передаём объект { id, model }, чтобы бэк знал, из какой модели читать
  ipcRenderer.invoke('load-ship-details', { id: shipId, model })
    .then(() => {
      window.location.href = 'shipFormular.html';
    })
    .catch(error => {
      console.error('Ошибка при загрузке деталей судна:', error);
    });
}
// ===================== ЗАВОД: Порт приписки / Страна-строитель =====================

// 2.1 Список портов приписки с количеством (на базе SeaFleet)
async getHomeports() {
  try {
    const { SeaFleet } = require('../database/models');
    const { Op, fn, col } = require('sequelize');

    const rows = await SeaFleet.findAll({
      attributes: [
        [col('port_of_registry'), 'value'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        port_of_registry: { [Op.not]: null, [Op.ne]: '' },
      },
      group: [col('port_of_registry')],
      order: [[col('port_of_registry'), 'ASC']],
      raw: true,
    });

    // Склейка дублей «вокруг пробелов/кейса» (как в getMovementTypes)
    const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
    const map = new Map(); // key = lower(norm), value = { value: показ, count }
    for (const r of rows) {
      const t = norm(r.value);
      if (!t) continue;
      const key = t.toLowerCase();
      const prev = map.get(key);
      map.set(key, { value: prev?.value || t, count: (prev?.count || 0) + (+r.count || 0) });
    }
    const out = Array.from(map.values()).sort((a,b)=> a.value.localeCompare(b.value,'ru'));
    return out; // [{ value, count }]
  } catch (err) {
    console.error('getHomeports error:', err);
    throw err;
  }
}

// 2.2 Постраничная выдача судов по выбранному порту приписки (SeaFleet)
async getVesselsByHomeport(_event, { homeport, offset = 0, limit = 200 }) {
  try {
    const { SeaFleet } = require('../database/models');
    const { Op, fn, col, where } = require('sequelize');

    const selected = String(homeport || '').replace(/\s+/g, ' ').trim();
    if (!selected) return { items: [], nextOffset: offset };

    const rows = await SeaFleet.findAll({
      attributes: [
        'id',
        [col('imo_number'),  'imo'],
        [col('vessel_name'), 'name'],
        [col('reg_number'),  'reg'],
      ],
      where: where(fn('TRIM', col('port_of_registry')), { [Op.iLike]: selected }),
      offset,
      limit,
      order: [['id','ASC']],
      raw: true,
    });

    return {
      items: rows.map(r => ({ id: r.id, imo: r.imo || '—', name: r.name || '—', reg: r.reg || '—' })),
      nextOffset: offset + rows.length,
    };
  } catch (err) {
    console.error('getVesselsByHomeport error:', err);
    throw err;
  }
}

// 2.3 Список стран-строителей с количеством (SeaFleet)
async getBuilderCountries() {
  try {
    const { SeaFleet } = require('../database/models');
    const { Op, fn, col } = require('sequelize');

    const rows = await SeaFleet.findAll({
      attributes: [
        [col('build_country'), 'value'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        build_country: { [Op.not]: null, [Op.ne]: '' },
      },
      group: [col('build_country')],
      order: [[col('build_country'), 'ASC']],
      raw: true,
    });

    const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
    const map = new Map();
    for (const r of rows) {
      const t = norm(r.value);
      if (!t) continue;
      const key = t.toLowerCase();
      const prev = map.get(key);
      map.set(key, { value: prev?.value || t, count: (prev?.count || 0) + (+r.count || 0) });
    }
    const out = Array.from(map.values()).sort((a,b)=> a.value.localeCompare(b.value,'ru'));
    return out; // [{ value, count }]
  } catch (err) {
    console.error('getBuilderCountries error:', err);
    throw err;
  }
}

// 2.4 Постраничная выдача судов по выбранной стране-строителю (SeaFleet)
async getVesselsByBuilderCountry(_event, { country, offset = 0, limit = 200 }) {
  try {
    const { SeaFleet } = require('../database/models');
    const { Op, fn, col, where } = require('sequelize');

    const selected = String(country || '').replace(/\s+/g, ' ').trim();
    if (!selected) return { items: [], nextOffset: offset };

    const rows = await SeaFleet.findAll({
      attributes: [
        'id',
        [col('imo_number'),  'imo'],
        [col('vessel_name'), 'name'],
        [col('reg_number'),  'reg'],
      ],
      where: where(fn('TRIM', col('build_country')), { [Op.iLike]: selected }),
      offset,
      limit,
      order: [['id','ASC']],
      raw: true,
    });

    return {
      items: rows.map(r => ({ id: r.id, imo: r.imo || '—', name: r.name || '—', reg: r.reg || '—' })),
      nextOffset: offset + rows.length,
    };
  } catch (err) {
    console.error('getVesselsByBuilderCountry error:', err);
    throw err;
  }
}
// ===================== /ЗАВОД =====================
}

module.exports = ShipBaseBack;
