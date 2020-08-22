require('./config/config');

const express = require('express');
const app = express();

//serializar lo que llega en las peticiones
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/usuario', function(req, res) {
    res.json('get usuario');
});

app.post('/usuario', function(req, res) {

    let body = req.body;
    if (!body.nombre) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    }

    res.json({ usuario: body });
});

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    res.json({ id });
});

app.delete('/usuario', function(req, res) {
    res.json('delete usuario');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puesto ' + process.env.PORT);
});