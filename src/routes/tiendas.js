const express = require('express');
const router = express.Router();

const mysqlConnection  = require('../database.js');
const { verificarToken } = require("../middlewares/verificarToken");
const {
  verificarRolDirectivo,
} = require("../middlewares/verificarRol");

// GET all Tiendas
router.get('/tiendas',[verificarToken], (req, res) => {
  mysqlConnection.query('SELECT pk_tienda, nombre FROM tbl_tienda', (err, rows, fields) => {
    if(!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });  
});

// GET A Tienda
router.get('/tienda/:id',[verificarToken], (req, res) => {
  const { id } = req.params; 
  mysqlConnection.query('SELECT pk_tienda, nombre FROM tbl_tienda WHERE pk_tienda = ?', [id], (err, rows, fields) => {
    if (!err) {
      res.json(rows[0]);
    } else {
      console.log(err);
    }
  });
});

// DELETE A Tienda
router.post('/tienda/delete/:id',[verificarToken, verificarRolDirectivo], (req, res) => {
  const { id } = req.params;
  mysqlConnection.query('DELETE FROM tbl_tienda WHERE pk_tienda = ?', [id], (err, rows, fields) => {
    if(!err) {
      res.json({status: 'Tienda Deleted'});
    } else {
      console.log(err);
    }
  });
});

// INSERT An tienda
router.post('/tienda',[verificarToken,verificarRolDirectivo], (req, res) => {
  const {pk_tienda, fk_zona, fk_municipio, nombre, tipo} = req.body;
  // console.log(pk_tienda, fk_zona, fk_municipio, nombre);
  const query = `
    SET @pk_tienda = ?;
    SET @fk_zona = ?;
    SET @fk_municipio = ?;
    SET @nombre = ?;
    SET @tipo = ?;
    CALL addTienda(@pk_tienda, @fk_zona, @fk_municipio, @nombre, @tipo );
  `;
  mysqlConnection.query(query, [pk_tienda, fk_zona, fk_municipio, nombre, tipo], (err, rows, fields) => {
    if(!err) {
      res.json({status: 'Tienda Saved'});
    } else {
      console.log(err);
    }
  });

});

router.post('/tienda/update/:id',[verificarToken, verificarRolDirectivo], (req, res) => {
  const { fk_zona, fk_municipio, nombre, tipo } = req.body;
  const { id } = req.params;
  const query = `
  SET @pk_tienda = ?;
  SET @fk_zona = ?;
  SET @fk_municipio = ?;
  SET @nombre = ?;
  SET @tipo = ?;
    CALL updateTienda(@pk_tienda, @fk_zona, @fk_municipio, @nombre, @tipo );
  `;
  mysqlConnection.query(query, [id, fk_zona, fk_municipio, nombre, tipo], (err, rows, fields) => {
    if(!err) {
      res.json({status: 'tienda Updated'});
    } else {
      console.log(err);
    }
  });
});

module.exports = router;