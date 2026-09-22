const mongoose = require('mongoose');
require('dotenv').config();

// FOR LOCAL DB SETUP
// const mongoURL = process.env.MONGODB_URL_LOCAL
const mongoURL = process.env.MONGODB_URL;
// const mongoURL = process.env.MONGODB_URL_LOCAL;

mongoose.connect(mongoURL)
if (!mongoURL) {
    console.error('MongoDB connection error: No MONGODB_URL or MONGODB_URL_LOCAL environment variable found.');
} else {
    mongoose.connect(mongoURL).catch(err => {
        console.error('MongoDB connection error:', err.message || err);
    });
}


const db = mongoose.connection;

db.on('connected',() => {
    console.log('Connected to MongoDB server');
    
});

db.on('error',(err) => {
    console.error('MongoDB connection error:', err);
    
});

db.on('disconnected',() => {
    console.log('MongoDB disconnected');
    
});


module.exports = db;