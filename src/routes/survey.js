const express = require("express");
const mysql = require("mysql");
const moment = require("moment-timezone");
const router = express.Router();

const mysqlConnection = require("../database.js");

// GET all Tipo Encuestas
router.get("/tipoencuestas", (req, res) => {
  mysqlConnection.query(
    "SELECT pk_tipoEncuesta, nombre, descripcion FROM tbl_tipoEncuestas",
    (err, rows, fields) => {
      if (!err) {
        res.json(rows);
      } else {
        console.log(err);
      }
    }
  );
});

// GET An encuesta
router.get("/encuesta/:id", (req, res) => {
  var result_array = [];
  var ids_pregunta = [];
  var preguntas_array = [];
  var responses_array = [];
  var structure_response = {
    nombre: "",
    descripcion: "",
    preguntas: [],
  };
  var structure_question = {
    pk_pregunta: 0,
    nombre: "",
    respuestas: [],
    porcentaje: "",
  };
  const { id } = req.params;
  const query = `SELECT nombre, descripcion, priceAPP.tbl_preguntaXEncuenta.pk_pregunta as pk_pregunta, pregunta, priceAPP.tbl_respuestasXPregunta.pk_pregunta as fk_pregunta, nombre_respuesta, porcentaje FROM priceAPP.tbl_preguntaXEncuenta 
  inner join tbl_tipoEncuestas 
  on priceAPP.tbl_tipoEncuestas.pk_tipoEncuesta = priceAPP.tbl_preguntaXEncuenta.pk_tipoEncuesta
  inner join tbl_respuestasXPregunta
  on priceAPP.tbl_respuestasXPregunta.pk_pregunta = priceAPP.tbl_preguntaXEncuenta.pk_pregunta
   WHERE tbl_preguntaXEncuenta.pk_tipoEncuesta = ?`;
  mysqlConnection.query(query, [id], (err, rows, fields) => {
    if (!err) {
      rows.forEach((row) => {
        if (structure_question["nombre"] != row["pregunta"]) {
          structure_question["nombre"] = row["pregunta"];
          structure_question["pk_pregunta"] = row["pk_pregunta"];
          preguntas_array.push(structure_question);
        }
      });
      console.log(preguntas_array);
      res.json(rows);
    } else {
      console.log(err);
    }
  });
});

// INSERT An tipo_encuesta
router.post("/encuesta/save", (req, res) => {
  const { nombre, descripcion, preguntas } = req.body;
  console.log(preguntas);
  const query = "INSERT INTO tbl_tipoEncuestas SET ?";
  const params = { nombre: nombre, descripcion: descripcion };
  mysqlConnection.query(query, params, (err, rows, fields) => {
    if (!err) {
      if (preguntas) {
        preguntas.forEach((pregunta) => {
          saveQuestions(rows["insertId"], pregunta);
        });
        res.json({ status: "encuesta Saved" });
      } else {
        res.json({ status: "estructura incorrecta" });
      }
    } else {
      console.log(err);
    }
  });
});

// Update An tipo_encuesta
router.post("/encuesta/update/:id", (req, res) => {
  const { nombre, descripcion, preguntas } = req.body;
  const { id } = req.params;
  const params = {
    nombre: nombre,
    descripcion: descripcion,
    pk_tipoEncuesta: id,
  };
  const query =
    "UPDATE tbl_tipoEncuestas SET nombre=?, descripcion=? where pk_tipoEncuesta=? ;";

  mysqlConnection.query(query, params, (err, rows, fields) => {
    if (!err) {
      preguntas.forEach((pregunta) => {
        saveQuestions(rows["insertId"], pregunta);
      });
      res.json({ status: "encuesta Saved" });
    } else {
      console.log(err);
    }
  });
});

router.post("/encuesta/asignar", (req, res) => {
  const { pk_tienda, pk_tipoEncuesta, fechaApertura, fechaCierre } = req.body;
  const params = {
    fechaApertura: fechaApertura,
    fechaCierre: fechaCierre,
    tbl_tipoEncuestas_pk_tipoEncuesta: pk_tipoEncuesta,
  };
  const query = "INSERT INTO tbl_aplicacionEncuesta SET ?";

  mysqlConnection.query(query, params, (err, rows, fields) => {
    if (!err) {
      asignSurvey(rows["insertId"], pk_tienda);

      res.json({ status: "encuesta asignada" });
    } else {
      console.log(err);
    }
  });
});

router.get("/encuestas/asignadas", (req, res) => {
  var CURRENT_TIMESTAMP = moment()
    .tz("America/Bogota")
    .format("YYYY-MM-DD HH:mm:ss");
  const query = `SELECT tbl_aplicacionEncuesta.pk_aplicacionEncuesta, tbl_tipoEncuestas.pk_tipoEncuesta, tbl_tipoEncuestas.nombre as encuesta, tbl_tipoEncuestas.descripcion,tbl_tienda_pk_tienda, tbl_tienda.nombre as tienda,
  tbl_aplicacionEncuesta.fechaApertura, tbl_aplicacionEncuesta.fechaCierre, tbl_aplicacionEncuesta.estado
  FROM priceAPP.tbl_encuestasXtiendas
  inner join tbl_tienda
  on tbl_tienda.pk_tienda = tbl_tienda_pk_tienda
  inner join tbl_aplicacionEncuesta
  on tbl_aplicacionEncuesta.pk_aplicacionEncuesta = tbl_aplicacionEncuesta_pk_aplicacionEncuesta
  inner join tbl_tipoEncuestas
  on tbl_aplicacionEncuesta.tbl_tipoEncuestas_pk_tipoEncuesta = tbl_tipoEncuestas.pk_tipoEncuesta
  WHERE tbl_aplicacionEncuesta.fechaCierre > ?;`;

  mysqlConnection.query(query, [CURRENT_TIMESTAMP], (err, rows, fields) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });
});

router.get("/encuestas/asignadas/tienda/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT tbl_aplicacionEncuesta.pk_aplicacionEncuesta, tbl_tipoEncuestas.pk_tipoEncuesta, tbl_tipoEncuestas.nombre as encuesta, tbl_tipoEncuestas.descripcion,tbl_tienda_pk_tienda, tbl_tienda.nombre as tienda,
  tbl_aplicacionEncuesta.fechaApertura, tbl_aplicacionEncuesta.fechaCierre
  FROM priceAPP.tbl_encuestasXtiendas
  inner join tbl_tienda
  on tbl_tienda.pk_tienda = tbl_tienda_pk_tienda
  inner join tbl_aplicacionEncuesta
  on tbl_aplicacionEncuesta.pk_aplicacionEncuesta = tbl_aplicacionEncuesta_pk_aplicacionEncuesta
  inner join tbl_tipoEncuestas
  on tbl_aplicacionEncuesta.tbl_tipoEncuestas_pk_tipoEncuesta = tbl_tipoEncuestas.pk_tipoEncuesta
  WHERE tbl_tipoEncuestas.pk_tipoEncuesta = ?;`;

  mysqlConnection.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });
});

router.post("/encuesta/llenar", (req, res) => {
  const { pk_aplicacionEncuesta, pk_tienda, solucion } = req.body;
  var CURRENT_TIMESTAMP = moment()
    .tz("America/Bogota")
    .format("YYYY-MM-DD HH:mm:ss");

  const query = "INSERT INTO tbl_solucionEncuesta SET ?";
  changeStateAsign(pk_aplicacionEncuesta);
  solucion.forEach((sol) => {
    var params = {
      fk_aplicacionEncuesta: pk_aplicacionEncuesta,
      fk_tienda: pk_tienda,
      pregunta: sol["pregunta"],
      respuesta: sol["respuesta"],
      fecha: CURRENT_TIMESTAMP,
    };
    mysqlConnection.query(query, params, (err, rows, fields) => {
      if (!err) {
        console.log("solucion added");
      } else {
        console.log(err);
      }
    });
  });
  res.json({
    status: "Encuesta terminada",
  });
});

router.get("/encuestas/powerbi", async (req, res) => {
  const query = `SELECT tbl_tipoEncuestas.pk_tipoEncuesta as pk_encuesta ,tbl_tipoEncuestas.nombre as encuesta ,tbl_tienda.pk_tienda as pk_tienda, tbl_tienda.nombre as almacen,  pregunta, respuesta, fecha
  from tbl_encuestasXtiendas
  inner join tbl_aplicacionEncuesta
  on tbl_aplicacionEncuesta.pk_aplicacionEncuesta = tbl_encuestasXtiendas.tbl_aplicacionEncuesta_pk_aplicacionEncuesta
  inner join tbl_solucionEncuesta
  on tbl_solucionEncuesta.fk_aplicacionEncuesta = tbl_aplicacionEncuesta.pk_aplicacionEncuesta
  inner join tbl_tienda
  on tbl_tienda.pk_tienda = tbl_solucionEncuesta.fk_tienda
  inner join tbl_tipoEncuestas
  on tbl_tipoEncuestas.pk_tipoEncuesta = tbl_aplicacionEncuesta.tbl_tipoEncuestas_pk_tipoEncuesta;`;
  mysqlConnection.query(query, (err, rows, fields) => {
    if (!err) {
      res.json(rows);
    } else {
      res.json({
        status: `error ${err}`,
      });
    }
  });
});

router.post("/encuestas/solucion", async (req, res) => {
  const { encuesta, tienda, pregunta, fecha_menor, fecha_mayor } = req.body;
  var query = "";
  var query_respuestas = "";
  var preguntas_array = [];

  if (fecha_menor != null) {
    query_respuestas = `SELECT respuesta, count(respuesta) as cantidad from tbl_encuestasXtiendas
    inner join tbl_aplicacionEncuesta
    on tbl_aplicacionEncuesta.pk_aplicacionEncuesta = tbl_encuestasXtiendas.tbl_aplicacionEncuesta_pk_aplicacionEncuesta
    inner join tbl_solucionEncuesta
    on tbl_solucionEncuesta.fk_aplicacionEncuesta = tbl_aplicacionEncuesta.pk_aplicacionEncuesta
    inner join tbl_tienda
    on tbl_tienda.pk_tienda = tbl_solucionEncuesta.fk_tienda
    inner join tbl_tipoEncuestas
    on tbl_tipoEncuestas.pk_tipoEncuesta = tbl_aplicacionEncuesta.tbl_tipoEncuestas_pk_tipoEncuesta 
    WHERE (tbl_tipoEncuestas.pk_tipoEncuesta = ${encuesta} OR ${encuesta} IS null) 
    AND (tbl_tienda.pk_tienda = ${tienda} OR ${tienda} IS null) 
    AND (pregunta = '${pregunta}' or '${pregunta}' = 'null')
    AND (fecha between '${fecha_menor}' AND  '${fecha_mayor}' )
  group by respuesta order by respuesta;`;
    query = `SELECT tbl_tipoEncuestas.pk_tipoEncuesta as pk_encuesta ,tbl_tipoEncuestas.nombre as encuesta ,tbl_tienda.pk_tienda as pk_tienda, tbl_tienda.nombre as almacen,  pregunta, respuesta, fecha
  from tbl_encuestasXtiendas
  inner join tbl_aplicacionEncuesta
  on tbl_aplicacionEncuesta.pk_aplicacionEncuesta = tbl_encuestasXtiendas.tbl_aplicacionEncuesta_pk_aplicacionEncuesta
  inner join tbl_solucionEncuesta
  on tbl_solucionEncuesta.fk_aplicacionEncuesta = tbl_aplicacionEncuesta.pk_aplicacionEncuesta
  inner join tbl_tienda
  on tbl_tienda.pk_tienda = tbl_solucionEncuesta.fk_tienda
  inner join tbl_tipoEncuestas
  on tbl_tipoEncuestas.pk_tipoEncuesta = tbl_aplicacionEncuesta.tbl_tipoEncuestas_pk_tipoEncuesta
  WHERE (tbl_tipoEncuestas.pk_tipoEncuesta = ${encuesta} OR ${encuesta} IS null) 
  AND (tbl_tienda.pk_tienda = ${tienda} OR ${tienda} IS null) 
  AND (pregunta = '${pregunta}' or '${pregunta}' = 'null')
  AND (fecha between '${fecha_menor}' AND  '${fecha_mayor}' );`;
  } else {
    query_respuestas = `SELECT respuesta, count(respuesta) as cantidad from tbl_encuestasXtiendas
    inner join tbl_aplicacionEncuesta
    on tbl_aplicacionEncuesta.pk_aplicacionEncuesta = tbl_encuestasXtiendas.tbl_aplicacionEncuesta_pk_aplicacionEncuesta
    inner join tbl_solucionEncuesta
    on tbl_solucionEncuesta.fk_aplicacionEncuesta = tbl_aplicacionEncuesta.pk_aplicacionEncuesta
    inner join tbl_tienda
    on tbl_tienda.pk_tienda = tbl_solucionEncuesta.fk_tienda
    inner join tbl_tipoEncuestas
    on tbl_tipoEncuestas.pk_tipoEncuesta = tbl_aplicacionEncuesta.tbl_tipoEncuestas_pk_tipoEncuesta
    WHERE (tbl_tipoEncuestas.pk_tipoEncuesta = ${encuesta} OR ${encuesta} IS null) 
  AND (tbl_tienda.pk_tienda = ${tienda} OR ${tienda} IS null) 
  AND (pregunta = '${pregunta}' or '${pregunta}' = 'null')
  group by respuesta order by respuesta;`;
    query = `SELECT tbl_tipoEncuestas.pk_tipoEncuesta as pk_encuesta,tbl_tipoEncuestas.nombre as encuesta , tbl_tienda.pk_tienda as pk_tienda,tbl_tienda.nombre as almacen,  pregunta, respuesta, fecha
    from tbl_encuestasXtiendas
    inner join tbl_aplicacionEncuesta
    on tbl_aplicacionEncuesta.pk_aplicacionEncuesta = tbl_encuestasXtiendas.tbl_aplicacionEncuesta_pk_aplicacionEncuesta
    inner join tbl_solucionEncuesta
    on tbl_solucionEncuesta.fk_aplicacionEncuesta = tbl_aplicacionEncuesta.pk_aplicacionEncuesta
    inner join tbl_tienda
    on tbl_tienda.pk_tienda = tbl_solucionEncuesta.fk_tienda
    inner join tbl_tipoEncuestas
    on tbl_tipoEncuestas.pk_tipoEncuesta = tbl_aplicacionEncuesta.tbl_tipoEncuestas_pk_tipoEncuesta
    WHERE (tbl_tipoEncuestas.pk_tipoEncuesta = ${encuesta} OR ${encuesta} IS null)
    AND (tbl_tienda.pk_tienda = ${tienda} OR ${tienda} IS null) 
    AND (pregunta = '${pregunta}' or '${pregunta}' = 'null');`;
  }

  mysqlConnection.query(query, (err, rows_general, fields) => {
    if (!err) {
      mysqlConnection.query(query_respuestas, (err, rows_barras, fields) => {
        if (!err) {
          mysqlConnection.query(
            "select distinct pregunta from priceAPP.tbl_solucionEncuesta;",
            (err, rows_pregunta, fields) => {
              if (!err) {
                mysqlConnection.query(
                  `SELECT distinct tbl_tipoEncuestas_pk_tipoEncuesta as pk_encuesta,tbl_tipoEncuestas.nombre as encuesta 
                from tbl_encuestasXtiendas
                inner join tbl_aplicacionEncuesta
                on tbl_aplicacionEncuesta.pk_aplicacionEncuesta = tbl_encuestasXtiendas.tbl_aplicacionEncuesta_pk_aplicacionEncuesta
                inner join tbl_solucionEncuesta
                on tbl_solucionEncuesta.fk_aplicacionEncuesta = tbl_aplicacionEncuesta.pk_aplicacionEncuesta
                inner join tbl_tienda
                on tbl_tienda.pk_tienda = tbl_solucionEncuesta.fk_tienda
                inner join tbl_tipoEncuestas
                on tbl_tipoEncuestas.pk_tipoEncuesta = tbl_aplicacionEncuesta.tbl_tipoEncuestas_pk_tipoEncuesta;`,
                  (err, rows_encuestas, fields) => {
                    if (!err) {
                      var bueno = {};
                      var regular = {};
                      var malo = {};
                      rows_pregunta.forEach(pregunta => {
                        preguntas_array.push(pregunta.pregunta)
                      });
                      var result_groupEncuestas = groupBy(
                        rows_general,
                        function (item) {
                          return [item.pk_encuesta, item.pk_tienda, item.fecha];
                        }
                      );
                      if (pregunta != null && rows_barras.length > 0) {
                        rows_barras.forEach((row) => {
                          if (row.respuesta == "Bueno") {
                            bueno = {
                              data: [row.cantidad],
                              label: [row.respuesta],
                              backgroundColor: ["#94FFB7"],
                            };
                          } else if (row.respuesta == "Regular") {
                            regular = {
                              data: [row.cantidad],
                              label: [row.respuesta],
                              backgroundColor: ["#94FFB7"],
                            };
                          } else {
                            malo = {
                              data: [row.cantidad],
                              label: [row.respuesta],
                              backgroundColor: ["#FFF894"],
                            };
                          }
                        });
                        res.json({
                          encuestas: rows_general,
                          preguntas: preguntas_array,
                          encuestas_filtro: rows_encuestas,
                          barras: {
                            labels: [pregunta],
                            datasets: [
                              bueno,
                              regular,
                              malo,
                            ],
                          },
                          kpi: result_groupEncuestas.length,
                        });
                      } else {
                        res.json({
                          encuestas: rows_general,
                          preguntas: preguntas_array,
                          encuestas_filtro: rows_encuestas,
                          barras: {},
                          kpi: result_groupEncuestas.length,
                        });
                      }
                    } else {
                      res.json({ status: err });
                    }
                  }
                );
              } else {
              }
            }
          );
        } else {
          console.log(err);
        }
      });
    } else {
      console.log(err);
    }
  });
});

router.post("/encuesta/delete/:id", (req, res) => {
  const { id } = req.params;
  const query_select = `SELECT *  FROM priceAPP.tbl_aplicacionEncuesta
  WHERE tbl_tipoEncuestas_pk_tipoEncuesta = ?`;
  mysqlConnection.query(query_select, [id], (err, rows, fields) => {
    if (!err) {
      if (rows.length > 0) {
        res.json({
          status: "Error encuesta asignada",
        });
      } else {
        deleteTipoencuesta(id);
        res.json({
          status: "encuesta eliminada",
        });
      }
    } else {
      console.log(err);
    }
  });
});

router.post("/encuesta/edit/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, preguntas } = req.body;
  const query =
    "UPDATE tbl_tipoEncuestas SET nombre=? , descripcion=? where pk_tipoEncuesta=?";
  const params = [nombre, descripcion, id];
  mysqlConnection.query(query, params, (err, rows, fields) => {
    if (!err) {
      mysqlConnection.query(
        "DELETE FROM tbl_preguntaXEncuenta WHERE pk_tipoEncuesta = ?",
        [id],
        (err, rows, fields) => {
          if (!err) {
            if (rows["affectedRows"] > 0) {
              preguntas.forEach((pregunta) => {
                saveQuestions(id, pregunta);
              });
            } else {
            }
          } else {
            console.log(err);
          }
        }
      );
      res.json({ status: "encuesta editada" });
    } else {
      console.log(err);
    }
  });
});

router.post("/encuesta/asign/delete/:id", (req, res) => {
  const { id } = req.params;
  const { pk_tienda } = req.body;
  const query =
    "DELETE FROM tbl_aplicacionEncuesta where pk_aplicacionEncuesta=?";
  const params = [id];
  deleteAsignSurveys(id, pk_tienda);
  mysqlConnection.query(query, params, (err, rows, fields) => {
    if (!err) {
      res.json({ status: "encuesta canceled" });
    } else {
      console.log(err);
    }
  });
});

router.post("/encuesta/asignar/edit/:id", (req, res) => {
  const { pk_tienda, pk_tipoEncuesta, fechaApertura, fechaCierre } = req.body;
  const { id } = req.params;
  const params = [pk_tienda, pk_tipoEncuesta, fechaApertura, fechaCierre];
  const query =
    "UPDATE tbl_aplicacionEncuesta SET pk_tienda=?, pk_tipoEncuesta=?, fechaApertura=?, fechaCierre=?";
  deleteAsignSurveys(id, pk_tienda);
  mysqlConnection.query(query, params, (err, rows, fields) => {
    if (!err) {
      asignSurvey(id, pk_tienda);

      res.json({ status: "asignacion updated" });
    } else {
      console.log(err);
    }
  });
});

function deleteTipoencuesta(id) {
  mysqlConnection.query(
    "DELETE FROM tbl_preguntaXEncuenta WHERE pk_tipoEncuesta = ?",
    [id],
    (err, rows, fields) => {
      if (!err) {
        mysqlConnection.query(
          "DELETE FROM tbl_tipoEncuestas WHERE pk_tipoEncuesta = ?",
          [id],
          (err, rows, fields) => {
            if (!err) {
              console.log("encuesta eliminada");
              console.log(rows["affectedRows"]);
            } else {
              console.log(err);
            }
          }
        );
      } else {
        console.log(err);
      }
    }
  );
}
function saveQuestions(id_tpEncuesta, pregunta) {
  const query = "INSERT INTO tbl_preguntaXEncuenta SET ?";
  const params = {
    pk_tipoEncuesta: id_tpEncuesta,
    pregunta: pregunta["nombre"],
  };
  mysqlConnection.query(query, params, (err, rows, fields) => {
    if (!err) {
      pregunta["respuestas"].forEach((respuesta) => {
        saveResponses(rows["insertId"], respuesta);
      });
      console.log("respuesta adicionada");
    } else {
      console.log(err);
    }
  });
}

function saveResponses(id_pregunta, respuesta) {
  const query = "INSERT INTO tbl_respuestasXPregunta SET ?";
  const params = { pk_pregunta: id_pregunta, nombre_respuesta: respuesta };
  mysqlConnection.query(query, params, (err, rows, fields) => {
    if (!err) {
      console.log("Pregunta adicionada");
    } else {
      console.log(err);
    }
  });
}

function asignSurvey(id_aplicacion, id_tienda) {
  const query = "INSERT INTO tbl_encuestasXtiendas SET ?";
  const params = {
    tbl_aplicacionEncuesta_pk_aplicacionEncuesta: id_aplicacion,
    tbl_tienda_pk_tienda: id_tienda,
  };
  mysqlConnection.query(query, params, (err, rows, fields) => {
    if (!err) {
      console.log("Encuesta Asignada");
    } else {
      console.log(err);
    }
  });
}

// DELETE asign Surveys
function deleteAsignSurveys(id_aplicacion, id_tienda) {
  mysqlConnection.query(
    "DELETE FROM tbl_encuestasXtiendas WHERE tbl_aplicacionEncuesta_pk_aplicacionEncuesta = ? AND tbl_tienda_pk_tienda = ?",
    [id_aplicacion, id_tienda],
    (err, rows, fields) => {
      if (!err) {
        console.log("asignacion Deleted");
      } else {
        console.log(err);
      }
    }
  );
}

function changeStateAsign(id) {
  var estado = 1;
  mysqlConnection.query(
    "UPDATE tbl_aplicacionEncuesta SET estado = ? WHERE pk_aplicacionEncuesta = ?",
    [estado, id],
    (err, rows, fields) => {
      if (!err) {
        console.log("asignacion update");
      } else {
        console.log(err);
      }
    }
  );
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
