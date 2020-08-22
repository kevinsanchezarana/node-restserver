require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

//serializar lo que llega en las peticiones
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(require('./routes/usuario'));

mongoose.connect('mongodb://localhost:27017/cafe', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err;
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puesto ' + process.env.PORT);
});