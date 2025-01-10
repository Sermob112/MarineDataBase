const { ipcMain } = require("electron");
const { MarinFleet } = require("../database/models");
const dfd = require("danfojs");



class AnalyzeData {


    constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    ipcMain.handle("createPivotTable", this.createPivotTable.bind(this));
    ipcMain.handle("createPivotTableTwoFields", this.createPivotTableTwoFields.bind(this));
  }
  async createPivotTable(event, fieldName) {
    try {
      console.log(`Fetching ships based on ${fieldName}...`);
      const ships = await MarinFleet.findAll({
        attributes: [fieldName],
        raw: true,
      });

      if (ships.length === 0) {
        console.log("No data found");
        return { message: "Данные отсутствуют!" };
      }

      ships.forEach((ship) => {
        if (ship[fieldName]) {
          ship[fieldName] = ship[fieldName].trim();
        }
      });

      const df = new dfd.DataFrame(ships);
      const grouped = df.groupby([fieldName]);
      const pivotTable = grouped.agg({ [fieldName]: "count" });
      pivotTable.rename({ [`${fieldName}_count`]: "Количество" }, { inplace: true });

      const jsonData = dfd.toJSON(pivotTable, { format: "records" });
      console.log("Prepared table data:", jsonData);
      return jsonData;
    } catch (error) {
      console.error("Ошибка при создании сводной таблицы:", error);
      throw error;
    }
  }

  async createPivotTableTwoFields(event, field1, field2) {
    try {
      console.log(`Fetching data based on ${field1} and ${field2}...`);
      
      // Запрос к базе данных с выбором двух атрибутов
      const ships = await MarinFleet.findAll({
        attributes: [field1, field2],
        raw: true,
      });

      if (ships.length === 0) {
        console.log("No data found for the given attributes");
        return { message: "Данные отсутствуют!" };
      }

      // Очистка данных (удаление пробелов в строках, если нужно)
      ships.forEach((ship) => {
        if (ship[field1]) ship[field1] = ship[field1].trim();
        if (ship[field2]) ship[field2] = ship[field2].trim();
      });

      // Преобразование в DataFrame для анализа
      const df = new dfd.DataFrame(ships);
      
      // Группировка по двум полям
      const grouped = df.groupby([field1, field2]);
      const pivotTable = grouped.agg({ [field1]: "count" });

      // Переименование столбцов для удобства
      pivotTable.rename(
        { [`${field1}_count`]: "Количество" },
        { inplace: true }
      );

      // Конвертация сводной таблицы в JSON
      const jsonData = dfd.toJSON(pivotTable, { format: "records" });
      console.log("Prepared pivot table data:", jsonData);
      return jsonData;

    } catch (error) {
      console.error("Ошибка при создании сводной таблицы:", error);
      throw error;
    }
  }
}
// const  anal = new AnalyzeData();
// anal.createPivotTableTwoFields(null,"overall_length","calc_length");
module.exports = AnalyzeData;