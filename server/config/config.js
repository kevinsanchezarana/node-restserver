//Puerto - Heroku tiene definida en el env PORT su puerto en pro, sino hay coge 3000
process.env.PORT = process.env.PORT || 3000;
//BD-MONGO - Heroku sabe si estamos en pro con esta variable
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//Vencimiento del token
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//Semilla de autenticación para verificar la firma del token
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'secret';

let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

process.env.CLIENT_ID = process.env.CLIENT_ID || '364529770827-5qjlhsaiidav5gj72od1dn0amij5efgo.apps.googleusercontent.com';