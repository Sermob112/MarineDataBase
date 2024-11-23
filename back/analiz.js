const { ipcMain } = require("electron");
const { MarinFleet } = require("../models");
const dfd = require("danfojs");



class AnalyzeData {


    constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    ipcMain.handle("createPivotTable", this.createPivotTable.bind(this));
  }
  async createPivotTable() {
    try {
      console.log("Fetching ships...");
      const ships = await MarinFleet.findAll({
        attributes: ["port_of_registry"],
        raw: true,
      });

     

      if (ships.length === 0) {
        console.log("No data found");
        return { message: "Данные отсутствуют!" };
      }

      ships.forEach((ship) => {
        if (ship.port_of_registry) {
          ship.port_of_registry = ship.port_of_registry.trim();
        }
      });
      const df = new dfd.DataFrame(ships);
     
      if (!df.columns.every((col, index, arr) => arr.indexOf(col) === index)) {
        throw new Error("Колонки в DataFrame должны быть уникальны");
      }
      const grouped = df.groupby(["port_of_registry"]);
      const pivotTable = grouped.agg({ port_of_registry: "count" });
      pivotTable.rename({ "port_of_registry_count": "count_per_port" }, { inplace: true });
      const jsonData = dfd.toJSON(pivotTable, { format: 'records' });
      

      console.log("Prepared table data:", jsonData);
      return jsonData;
    } catch (error) {
      console.error("Ошибка при создании сводной таблицы:", error);
      throw error;
    }
  }
}
// const  anal = new AnalyzeData();
// anal.createPivotTable();
module.exports = AnalyzeData;