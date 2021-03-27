const express = require('express');
const router = express.Router();

const mysqlConnection  = require('../database.js');
const { verificarToken } = require("../middlewares/verificarToken");
const {
  verificarRolAdministrador,
  verificarRolDirectivo,
} = require("../middlewares/verificarRol");

// GET all departamentos
router.get('/deptos/all', [verificarToken], (req, res) => {
    mysqlConnection.query('SELECT * FROM tbl_departamento', (err, rows, fields) => {
      if(!err) {
        res.json(rows);
      } else {
        console.log(err);
      }
    });  
  });

// GET all municipios
router.get('/municipios/all',[verificarToken], (req, res) => {
  mysqlConnection.query('SELECT * FROM tbl_municipio order by nombre', (err, rows, fields) => {
    if(!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });  
});

// GET A ZONAS
router.get('/zona/all',[verificarToken], (req, res) => {
  mysqlConnection.query('SELECT * FROM tbl_zona', (err, rows, fields) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });
});

module.exports = router;