const express = require('express');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const app = express();
//añade funciones extras de js a node
const _ = require('underscore');

const Categoria = require('../models/categoria');

//Obtener todas las categorias
app.get('/categoria', verificaToken, (req, res) => {

    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;

    Categoria
        .find()
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre, email') //Traerte las relaciones (join)
        .sort('descripcion')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments((err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    categorias,
                    total: conteo
                });

            });

        });

});

//Obtener una categoria por id
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//Crear nueva categoria y la devuelve
app.post('/categoria', verificaToken, async(req, res) => {
    let body = req.body;
    //Lo obtenemos del middleware
    let usuarioId = req.usuario._id;
    const { descripcion } = body;

    //Para el usuario se puede pasar el id o el objeto entero
    const categoria = new Categoria({
        descripcion,
        usuario: usuarioId
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

//Actualizar la categoria (solo el nombre)
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    //Te hace una copia con solo las propiedades del objeto que tu quieras
    let body = _.pick(req.body, ['descripcion']);
    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//Eliminar la categoria
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    const id = req.params.id;

    // Lo borra en BBDD
    Categoria.findByIdAndRemove(id, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    'message': "Categoria no existe"
                }
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB //Categoria borrada
        });
    });
});


module.exports = app;