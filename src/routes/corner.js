const express = require("express");
const mysql = require("mysql");
const mysqlConnection = require("../database");
const { get } = require("./survey");
const router = express.Router();

router.get("/corner/all", (req, res) => {
  mysqlConnection.query(
    "SELECT * FROM priceAPP.corner",
    (err, rows, fields) => {
      if (!err) {
        res.json(rows);
      } else {
        res.json({ status: err });
      }
    }
  );
});

router.get("/corner/:id", (req, res) => {
  const { id } = req.params;
  mysqlConnection.query(
    "SELECT * FROM priceAPP.corner WHERE codigo = ? ",
    [id],
    (err, rows, fields) => {
      if (!err) {
        res.json(rows);
      } else {
        res.json({ status: err });
      }
    }
  );
});

router.post("/corner/add", (req, res) => {
  const { codigo, descuento } = req.body;
  const query = `INSERT INTO priceAPP.corner (CODIGO,DESCUENTO) values (?,?)`;
  mysqlConnection.query(query, [codigo, descuento], (err, rows, fields) => {
    if (!err) {
      res.json({ status: "corner add" });
    } else {
      res.json({ status: err });
    }
  });
});

router.post("/corner/update/:id", (req, res) => {
  const { descuento } = req.body;
  const { id } = req.params;
  const query = "UPDATE priceAPP.corner SET DESCUENTO=? where CODIGO=? ;";

  mysqlConnection.query(query, [descuento,id], (err, rows, fields) => {
    if (!err) {
      res.json({ status: "corner updated" });
    } else {
      res.json({ status: err });
    }
  });
});

router.post("/corner/delete/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM priceAPP.corner where CODIGO=? ;";
  
    mysqlConnection.query(query, [id], (err, rows, fields) => {
      if (!err) {
        res.json({ status: "corner deleted" });
      } else {
        res.json({ status: err });
      }
    });
  });

module.exports = router;
