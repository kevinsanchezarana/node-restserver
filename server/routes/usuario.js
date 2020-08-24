const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
//añade funciones extras de js a node
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

//Devuelve solo estados activos
app.get('/usuario', verificaToken, (req, res) => {

    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;

    Usuario
        .find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments({ estado: true }, (err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    usuarios,
                    total: conteo
                });

            });

        });
});

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;
    //Te hace una copia con solo las propiedades del objeto que tu quieras
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    // Lo borra en BBDD
    // Usuario.findByIdAndRemove(id, { new: true, runValidators: true }, (err, usuarioDB) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }
    //     if (!usuarioDB) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 'message': "Usuario no existe"
    //             }
    //         });
    //     }
    //     res.json({
    //         ok: true,
    //         usuario: usuarioDB
    //     });
    // });

    // Cambia a estado=false en vez de eliminarlo de bbdd
    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    'message': "Usuario no existe"
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

module.exports = app;