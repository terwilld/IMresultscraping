
const mongoose = require('mongoose');
require('dotenv').config()
const express = require('express');
const indexRoutes = require('./routes/index.js')
const scrapeIM = require('./scraping/scrapeIM.js')
const scrapeIM2 = require('./scraping/scrapeIM2.js')
const scrapeIM3 = require('./scraping/scrapeIM3.js')
const path = require('path')
const ejsMate = require('ejs-mate');
const loadEvents = require('./scraping/loadEvents')
const loadAllIMEvents = require('./scraping/loadAllIMEvents')
const morgan = require('morgan')
const logger = require('./logger')

if (process.env.NODE_ENV == "production") {
    dbURL = process.env.dbURL;
    secret = process.env.secret;
    axiosURL = process.env.axiosURL;
} else {
    dbURL = 'mongodb://127.0.0.1:27017/resultscraping';
    secret = 'secret';
    axiosURL = 'http://localhost:3000'

}


console.log(axiosURL)

runScraper = process.env.runScraper
fullLoad = process.env.fullLoad
console.log(runScraper)

mongoose.connect(dbURL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected by mongoose")
    console.log(dbURL)
})

const app = express();



app.use(express.static(path.join(__dirname, 'public')))
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')


app.set('views', path.join(__dirname, './views'))
app.use('/', indexRoutes)
app.listen(3000, () => {
    console.log('app is running on 3000')
})





//loadEvents()



logger.info('Hello, world!');
logger.error('test')

if (fullLoad == 'true') {

    //loadAllIMEvents();
}
if (runScraper == 'true') {
    console.log("Running Scraper")
    //scrapeIM2();
    scrapeIM3();
}