const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json()); //express body-parser packages as json for rest api. another one is as x-www-form-urlencoded
app.use('/images', express.static(path.join(__dirname, 'images')));

//CORS Error fixed
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //Which origin could use this server. This could also spesific example: 'Access-Control-Allow-Origin', 'codepen.io'
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); //Allow the client to execute this method
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); //Allow the client to have access to content-type and authorization
    next();
})

//Multer for handling image upload
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        const unique = Date.now();
        cb(null, unique + '-' + file.originalname)
    },
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);

//Express error handling middleware
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data
    res.status(status).json({ message: message, error: data})
})

mongoose.connect('mongodb+srv://irfan10112001:LUItjKpyXWjSMnjV@cluster0.0xkz4.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0')
.then(result => {
    console.log('CONNECTED');
    app.listen(8080);
})
.catch(err => {
    next(err);
})