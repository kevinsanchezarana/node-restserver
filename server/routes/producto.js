const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
const app = express();
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');

//Obtener todos los productos con usuario y categoria, paginado
app.get('/productos', verificaToken, (req, res) => {

    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;

    Producto
        .find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre, email')
        .populate('categoria', 'descripcion')
        .sort('nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments((err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    productos,
                    total: conteo
                });

            });

        });

});

//Obtener todos los producto con usuario y categoría
app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });

});

app.post('/productos', verificaToken, async(req, res) => {
    let body = req.body;
    //Lo obtenemos del middleware
    let usuarioId = req.usuario._id;
    const { nombre, descripcion, precioUni, categoria } = body;

    let categoriaDB = await Categoria.findOne({ 'descripcion': categoria }, (err, categoriaDB) => { return err ? null : categoriaDB; });
    if (!categoriaDB) {
        categoriaDB = new Categoria({
            descripcion: categoria,
            usuario: usuarioId
        });
        categoriaDB = await categoriaDB.save((err, categoriaNuevaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaNuevaDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            return categoriaNuevaDB;
        });

    }

    const producto = new Producto({
        nombre,
        descripcion,
        precioUni,
        disponible: true,
        categoria: categoriaDB,
        usuario: usuarioId
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });
});

app.put('/productos/:id', verificaToken, async(req, res) => {
    //grabar el usuario
    //grabar una categoria del listado
    let id = req.params.id;
    let body = req.body;
    //Lo obtenemos del middleware
    let usuarioId = req.usuario._id;
    const { nombre, descripcion, precioUni, categoria } = body;

    let categoriaDB = await Categoria.findOne({ 'descripcion': categoria }, (err, categoriaNuevaDB) => {
        return err ? null : categoriaNuevaDB;
    });

    if (!categoriaDB) {
        categoriaDB = new Categoria({
            descripcion: categoria,
            usuario: usuarioId
        });
        categoriaDB = await categoriaDB.save((err, categoriaNuevaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaNuevaDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            return categoriaNuevaDB;
        });

    }

    const updatedFields = { nombre, descripcion, precioUni, 'categoria': categoriaDB };
    Producto.findByIdAndUpdate(id, updatedFields, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

app.delete('/productos/:id', verificaToken, (req, res) => {
    //marcarlo como disponible a false
    let id = req.params.id;
    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });

});

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    //Like
    let regex = new RegExp(termino, 'i');
    Producto
        .find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .sort('nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                productos
            });

        });

});


module.exports = app;