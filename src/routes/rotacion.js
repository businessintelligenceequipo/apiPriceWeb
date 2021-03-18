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
              leerExcel(ruta, results, rows);
              var result_groupEncuestas = groupBy(rotation, function (item) {
                return [item.data.CODIGO];
              });
              // result_groupEncuestas.forEach((element) => {
              //   console.log(element[0]);
              // });
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

function leerExcel(ruta, saldos, corner) {
  const workbook = xlsx.readFile(ruta);
  const workbooksheet = workbook.SheetNames;
  const sheet = workbooksheet[0];
  const dataExcel = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
  getRotacion(dataExcel, saldos, corner);
}

function getRotacion(referencias, saldos, corner) {
  for (const ref of referencias) {
    var data_general = {};
    var rot;
    var rot_general = 0;
    var children = [];
    var subtotal_invetario = 0;
    var subtotal_venta = 0;
    var estado = "";
    var estado_general = "";
    var resul_corner;
    items_saldos = saldos.filter(function (item) {
      return item.d_producto == ref["descripcion_prov"];
    });
    for (const sal of saldos) {
      if (ref["descripcion_prov"] == sal["d_producto"]) {
        items = corner.filter(function (item) {
          return item.CODIGO == sal["d_producto"] + sal["d_color_proveedor"];
        });
        if (items.lenght) {
          resul_corner = items[0].DESCUENTO;
        } else {
          resul_corner = "0%";
        }
        subtotal_invetario = items_saldos.reduce(function (sum, saldo) {
          return sum + parseInt(saldo.saldo_disponible);
        }, 0);
        subtotal_venta = items_saldos.reduce(function (sum, saldo) {
          return sum + parseInt(saldo.to_cantidad);
        }, 0);
        if (subtotal_venta > 0) {
          rot_general = (subtotal_invetario / subtotal_venta) * 28;
        } else if (subtotal_venta == 0) {
          rot_general = 0;
        } else {
          rot_general = -1;
        }
        if (rot_general > 0 && rot_general < 90) {
          estado_general = "Rotación Alta";
        } else if (rot >= 90 && rot <= 250) {
          estado_general = "Rotación Baja";
        } else if (rot > 250) {
          estado_general = "No Rota";
        } else if (rot == 0) {
          estado_general = "No Rota";
        } else {
          estado_general = "Devolucion";
        }
        // subtotal_invetario += parseInt(sal["saldo_disponible"]);
        // subtotal_venta += parseInt(sal["to_cantidad"]);
        if (parseInt(sal["to_cantidad"]) > 0) {
          rot =
            (parseInt(sal["saldo_disponible"]) / parseInt(sal["to_cantidad"])) *
            28;
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

        children.push({
          data: {
            CODIGO: sal["d_producto"] + sal["d_color_proveedor"],
            ALM: sal["c_almacen"],
            COSTO: ref["pr_compra"],
            PUBLICO: ref["pr_venta"],
            INV: sal["saldo_disponible"],
            VTA: sal["to_cantidad"],
            ROT: rot,
            CORNER: resul_corner,
            ESTADO: estado,
            LINEA: ref["d_linea"],
            CATEGORIA: ref["d_categoria"],
            SUBCATEGORIA: ref["d_subcategoria"],
            SEGMENTO: ref["d_segmento"],
            TALLA: ref["talla"],
            COLOR: sal["d_color_proveedor"],
          },
        });
        data_general = {
          data: {
            CODIGO: sal["d_producto"] + sal["d_color_proveedor"],
            ALM: sal["c_almacen"],
            COSTO: ref["pr_compra"],
            PUBLICO: ref["pr_venta"],
            INV: subtotal_invetario,
            VTA: subtotal_venta,
            ROT: rot_general,
            CORNER: resul_corner,
            ESTADO: estado_general,
            LINEA: ref["d_linea"],
            CATEGORIA: ref["d_categoria"],
            SUBCATEGORIA: ref["d_subcategoria"],
            SEGMENTO: ref["d_segmento"],
            TALLA: ref["talla"],
            COLOR: sal["d_color_proveedor"],
          },
          children: children,
        };
      }
    }

    if ('children' in data_general) rotation.push(data_general);
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
