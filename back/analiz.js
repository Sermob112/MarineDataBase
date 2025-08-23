const { ipcMain } = require("electron");
const models = require("../database/models");   // <-- контейнер
const dfd = require("danfojs");

class AnalyzeData {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    ipcMain.handle("createPivotTable", this.createPivotTable.bind(this));
    ipcMain.handle("createPivotTableTwoFields", this.createPivotTableTwoFields.bind(this));
  }

  async createPivotTable(_event, fieldName) {
    try {
      console.log(`Fetching ships based on ${fieldName}...`);
      const ships = await models.MarinFleet.findAll({
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

  async createPivotTableTwoFields(_event, field1, field2) {
    try {
      console.log(`Fetching data based on ${field1} and ${field2}...`);
      const ships = await models.MarinFleet.findAll({
        attributes: [field1, field2],
        raw: true,
      });

      if (ships.length === 0) {
        console.log("No data found for the given attributes");
        return { message: "Данные отсутствуют!" };
      }

      ships.forEach((ship) => {
        if (ship[field1]) ship[field1] = ship[field1].trim();
        if (ship[field2]) ship[field2] = ship[field2].trim();
      });

      const df = new dfd.DataFrame(ships);
      const grouped = df.groupby([field1, field2]);
      const pivotTable = grouped.agg({ [field1]: "count" });
      pivotTable.rename({ [`${field1}_count`]: "Количество" }, { inplace: true });

      const jsonData = dfd.toJSON(pivotTable, { format: "records" });
      console.log("Prepared pivot table data:", jsonData);
      return jsonData;

    } catch (error) {
      console.error("Ошибка при создании сводной таблицы:", error);
      throw error;
    }
  }
}

module.exports = AnalyzeData;
