const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const { verificaTokenImg } = require('../middlewares/autenticacion');


app.get('/imagen/:tipo/:img', verificaTokenImg, (req, resp) => {

    const { tipo, img } = req.params;
    const defaultImg = path.resolve(__dirname, `../assets/no-image.jpg`);

    const pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    if (fs.existsSync(pathImagen)) {
        return resp.sendFile(pathImagen);
    }

    return resp.sendFile(defaultImg);

});



module.exports = app;