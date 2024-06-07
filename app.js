
const mongoose = require('mongoose');
require('dotenv').config()
const express = require('express');
const indexRoutes = require('./routes/index.js')
const scrapeIM = require('./scraping/scrapeIM.js')
const path = require('path')
const ejsMate = require('ejs-mate');

if (process.env.NODE_ENV == "production") {
    dbURL = process.env.dbURL
    secret = process.env.secret
} else {
    dbURL = 'mongodb://127.0.0.1:27017/resultscraping'
    secret = 'secret'
}

mongoose.connect(dbURL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected by mongoose")
})

const app = express();




app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')

//scrapeIM();
app.set('views', path.join(__dirname, './views'))
app.use('/', indexRoutes)
app.listen(3000, () => {
    console.log('app is running on 3000')
})