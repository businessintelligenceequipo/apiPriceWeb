const controllerUsuarios = {};
const express = require("express");
const mysqlConnection = require("../database");
const router = express.Router();
const bcryp = require("bcrypt");
const pool = require("../database");
const jwt = require("jsonwebtoken");

router.post("/signup", (req, res) => {
  const data = {
    identificacion: req.body.identificacion,
    nombre: req.body.nombre,
    apellidos: req.body.apellidos,
    rol: req.body.rol,
    tienda: req.body.tienda,
    usuario: req.body.usuario,
    correo: req.body.correo,
    password: bcryp.hashSync(req.body.password, 10),
  };

  mysqlConnection.query(
    "INSERT INTO tbl_usuarios set ?",
    [data],
    (err, rows, fields) => {
      if (!err) {
        res.json({ status: "Registro existoso" });
      } else {
        return res.json({
          status: err["code"],
        });
      }
    }
  );
});

router.get("/usuarios", (req, res) => {
  const query = `SELECT identificacion, u.nombre, apellidos, r.nombre as rol, t.nombre as tienda , correo FROM tbl_usuarios as u
    inner join tbl_tienda as t
    on t.pk_tienda = u.tienda
    inner join tbl_roles as r
    on r.ID = u.rol`;
  mysqlConnection.query(query, (err, rows, fields) => {
    if (!err) {
      res.json(rows);
    } else {
      res.json(err);
    }
  });
});

router.get("/usuario/:id", (req, res) => {
  let id = req.params.id;
  const query = `SELECT identificacion, u.nombre, apellidos, r.nombre as rol, t.nombre as tienda , correo FROM tbl_usuarios as u
      inner join tbl_tienda as t
      on t.pk_tienda = u.tienda
      inner join tbl_roles as r
      on r.ID = u.rol
      WHERE identificacion = ?`;
  mysqlConnection.query(query, [id], (err, rows, fields) => {
    if (!err) {
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.json({ status: "Usuario no registrado" });
      }
    } else {
      res.json(err);
    }
  });
});

router.post("/login", async (req, res) => {
  const { usuario, password } = req.body;

  mysqlConnection.query(
    `SELECT * FROM tbl_usuarios WHERE usuario = "${usuario}"`,
    (err, rows, fields) => {
      if (rows.length == 0) {
        return res.json({
          status: "Usuario incorrecto",
        });
      }
      //   if (bcryp.compareSync(password, rows[0].password)) {
      console.log(bcryp.compareSync(password, rows[0].password));
      const usu = jwt.sign({ data: rows }, "secret_token", {
        expiresIn: "12h",
      });

      return res.json({
        status: true,
        token: usu,
        user: rows,
      });
      //   } else {
      //     return res.json({
      //       status: "Contraseña Incorrecta",
      //     });
      //   }
    }
  );
});

router.post("/usuario/update/:id", (req, res) => {
  let id = req.params.id;
  const data = req.body;
  var query = "UPDATE tbl_usuarios SET ? WHERE identificacion= ?";

  mysqlConnection.query(query, [data, id], (err, rows, fields) => {
    if (!err) {
        if(rows.affectedRows > 0){
            res.json({ status: "Usuario actualizado" });
        }else{
            res.json({ status: "Usuario no registrado" });
        }
    } else {
      res.json(err);
    }
  });
});

router.post("/usuario/delete/:id", (req, res) => {
  let id = req.params.id;
  var query = "DELETE FROM tbl_usuarios  WHERE identificacion= ?";

  mysqlConnection.query(query, [id], (err, rows, fields) => {
    if (!err) {
        if(rows.affectedRows > 0){
            res.json({ status: "Registro Eliminado" });
        }else{
            res.json({ status: "Usuario no registrado" });
        }
      
    } else {
      res.json(err);
    }
  });
});

module.exports = router;
