const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options - middleware (genera el objeto files)
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ ok: false, err: { message: 'No se ha seleccionado ningún archivo' } });
    }
    let tipo = req.params.tipo;
    let id = req.params.id;

    const tiposValidos = ['productos', 'usuarios'];
    if (!tiposValidos.includes(tipo)) {
        res.status(400).json({ ok: false, err: { message: `Los tipos permitidos son ${tiposValidos.join(', ')}` } });
    }


    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let { archivo } = req.files;

    //Extensiones permitidas
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let nombreArchivo = archivo.name.split('.');
    const extension = nombreArchivo[nombreArchivo.length - 1];

    if (!extensionesValidas.includes(extension)) {
        res.status(400).json({ ok: false, err: { message: `Las extensiones permitidas son ${extensionesValidas.join(', ')}`, ext: extension } });
    }

    //Cambiar nombre archivo
    nombreArchivo = `${id}-${ new Date().getTime()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, err => {
        if (err) {
            return res.status(500).json({ ok: false, err });
        }

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else if (tipo === 'productos') {
            imagenProducto(id, res, nombreArchivo);
        }

    });
});

const imagenUsuario = (id, res, nombreAchivo) => {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraImagenAnterior(nombreAchivo, 'usuarios');
            return res.status(500).json({ ok: false, err });
        }

        if (!usuarioDB) {
            borraImagenAnterior(nombreAchivo, 'usuarios');
            return res.status(400).json({ ok: false, err: { message: 'Usuario no existe' } });
        }

        borraImagenAnterior(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreAchivo;
        usuarioDB.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(500).json({ ok: false, err });
            }

            res.json({ ok: true, usuario: usuarioGuardado, img: nombreAchivo });
        });


    });

}

const imagenProducto = (id, res, nombreAchivo) => {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraImagenAnterior(nombreAchivo, 'productos');
            return res.status(500).json({ ok: false, err });
        }

        if (!productoDB) {
            borraImagenAnterior(nombreAchivo, 'productos');
            return res.status(400).json({ ok: false, err: { message: 'Producto no existe' } });
        }

        borraImagenAnterior(productoDB.img, 'productos');

        productoDB.img = nombreAchivo;
        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({ ok: false, err });
            }

            res.json({ ok: true, producto: productoGuardado, img: nombreAchivo });
        });


    });

}

const borraImagenAnterior = (nombre, tipo) => {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombre}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;