//Puerto - Heroku tiene definida en el env PORT su puerto en pro, sino hay coge 3000
process.env.PORT = process.env.PORT || 3000;
//BD-MONGO - Heroku sabe si estamos en pro con esta variable
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;