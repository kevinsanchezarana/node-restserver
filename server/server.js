require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

//serializar lo que llega en las peticiones
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//Habilitar un directorio para que sea publico
app.use(express.static(path.resolve(__dirname, '../public')));

app.use(require('./routes/index'));

console.log(process.env.URLDB);
mongoose
    .connect(process.env.URLDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(result => console.log('Base de datos ONLINE'))
    .catch(err => console.log(err));

app.listen(process.env.PORT, () => {
    console.log('Escuchando puesto ' + process.env.PORT);
});