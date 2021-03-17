const csv = require("csv-parser");
const fs = require("fs");
const express = require("express");
const mysql = require("mysql");
const moment = require("moment");
const router = express.Router();
const xlsx = require("xlsx");
const mysqlConnection = require("../database");
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
        mysqlConnection.query(
          "SELECT * FROM priceAPP.corner",
          (err, rows, fields) => {
            if (!err) {
              leerExcel(ruta, results,rows);
              var result_groupEncuestas = groupBy(
                rotation,
                function (item) {
                  return [item.CODIGO];
                }
              );
              result_groupEncuestas.forEach(element => {
                console.log(element[0])
              });
              res.json(rotation);
            } else {
              res.json({ status: err });
            }
          }
        );
      } else {
        res.json({ status: "Falta de memoria" });
      }
    });
});

function leerExcel(ruta, saldos,corner) {
  const workbook = xlsx.readFile(ruta);
  const workbooksheet = workbook.SheetNames;
  const sheet = workbooksheet[0];
  const dataExcel = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
  getRotacion(dataExcel, saldos, corner);
}

function getRotacion(referencias, saldos, corner) {
  var rot = 0;
  var subtotal = 0;
  
  for (const ref of referencias) {
    var rot;
    var children = []
    var subtotal_invetatio = 0;
    var subtotal_venta = 0;
    var estado = "";
    var resul_corner;
    for (const sal of saldos) {
      if (ref["descripcion_prov"] == sal["d_producto"]) {
        items = corner.filter(function(item){
          return (item.CODIGO == sal["d_producto"] + sal["d_color_proveedor"]);
        });
        if (items.lenght) {
          resul_corner = items[0].DESCUENTO
        } else {
          resul_corner = '0%'
          
        }
        subtotal_invetatio += parseInt(sal["saldo_disponible"]);
        subtotal_venta += parseInt(sal["to_cantidad"]);
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
        } else {
          estado = "Devolucion";
        }
        rotation.push({
          CODIGO: sal["d_producto"] + sal["d_color_proveedor"],
          ALM: sal["c_almacen"],
          COSTO: ref["pr_compra"],
          PUBLICO: ref["pr_venta"],
          INV: sal["saldo_disponible"],
          VTA: sal["to_cantidad"],
          ROT: rot,
          CORNER: resul_corner,
          ESTADO: estado, 
          LINEA:ref["d_linea"],
          CATEGORIA: ref["d_categoria"],
          SUBCATEGORIA: ref["d_subcategoria"],
          SEGMENTO: ref["d_segmento"],
          TALLA: ref["talla"],
          COLOR:sal["d_color_proveedor"]
        });
      }
    }
  }
}

function groupBy(array, f) {
  var groups = {};
  array.forEach(function (o) {
    var group = JSON.stringify(f(o));
    groups[group] = groups[group] || [];
    groups[group].push(o);
  });
  return Object.keys(groups).map(function (group) {
    return groups[group];
  });
}

module.exports = router;
