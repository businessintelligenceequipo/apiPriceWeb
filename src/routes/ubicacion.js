const express = require('express');
const router = express.Router();

const mysqlConnection  = require('../database.js');

// GET all departamentos
router.get('/deptos/all', (req, res) => {
    mysqlConnection.query('SELECT * FROM tbl_departamento', (err, rows, fields) => {
      if(!err) {
        res.json(rows);
      } else {
        console.log(err);
      }
    });  
  });

// GET all municipios
router.get('/municipios/all', (req, res) => {
  mysqlConnection.query('SELECT * FROM tbl_municipio order by nombre', (err, rows, fields) => {
    if(!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });  
});

// GET A ZONAS
router.get('/zona/all', (req, res) => {
  mysqlConnection.query('SELECT * FROM tbl_zona', (err, rows, fields) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });
});

module.exports = router;