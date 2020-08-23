require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

//serializar lo que llega en las peticiones
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(require('./routes/usuario'));

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