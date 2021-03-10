const csv = require("csv-parser");
const fs = require("fs");
const express = require("express");
const mysql = require("mysql");
const moment = require("moment");
const router = express.Router();
const xlsx = require("xlsx");
const results = [];
const rotation = [];

// fs.createReadStream("Sal_vsVent Febrero.csv")
//   .pipe(csv({ delimiter: ";" }))
//   .on("data", (data) => results.push(data))
//   .on("end", () => {
//     console.log(results[0]);
//   });
router.get("/rotacion/invetario", (req, res) => {
  const ruta = "ARCHIVO REFERENCIAS.xlsx";
  fs.createReadStream("Sal_vsVent Febrero - copia.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", (err) => {
      if (!err) {
        leerExcel(ruta, results);
        res.json(rotation);
      } else {
        res.json({ status: "Falta de memoria" });
      }
    });
});

function leerExcel(ruta, saldos) {
  const workbook = xlsx.readFile(ruta);
  const workbooksheet = workbook.SheetNames;
  const sheet = workbooksheet[0];
  const dataExcel = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
  getRotacion(dataExcel, saldos);
}

function getRotacion(referencias, saldos) {
  var rot = 0;
  var subtotal = 0;
  for (const ref of referencias) {
    var rot;
    var subtotal_invetatio = 0;
    var subtotal_venta = 0;
    var estado = "";
    for (const sal of saldos) {
      if (ref["descripcion_prov"] == sal["d_producto"]) {
        subtotal_invetatio += parseInt(sal["saldo_disponible"]);
        subtotal_venta += parseInt(sal["to_cantidad"]);
        // console.log(ref["descripcion_prov"]);
        // console.log(subtotal);
        if (parseInt(sal["to_cantidad"]) > 0) {
          rot =
            (parseInt(sal["saldo_disponible"]) / parseInt(sal["to_cantidad"])) *
            30;
        } else if (parseInt(sal["to_cantidad"]) == 0) {
          rot = 0;
        } else {
          rot = -1;
        }
        if (rot > 0 && rot < 90) {
          estado = "Rotación Alta";
        } else if (rot >= 90 && rot <= 250) {
          estado = "Rotación Baja";
        } else if (rot > 250) {
          estado = "No Rota";
        } else if (rot == 0) {
          estado = "No Rota";
        }else{
          estado = "Devolucion"
        }
        rotation.push({
          CODIGO: sal["d_producto"] + sal["d_color_proveedor"],
          ALM: sal["c_almacen"],
          COSTO: ref["pr_compra"],
          PUBLICO: ref["pr_venta"],
          INV: sal["saldo_disponible"],
          VTA: sal["to_cantidad"],
          ROT: rot,
          CORNER: 0,
          ESTADO: estado,
        });
      }
    }
  }
}
module.exports = router;
