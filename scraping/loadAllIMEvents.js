const puppeteer = require('puppeteer')
const mongoose = require('mongoose');

async function loadAllIMEvents() {
    //console.log("Inside loading all events")


    await getAllEvents()




}

async function getAllEvents() {
    console.log("Get all events")
    //https://www.ironman.com/races
    var headless = process.env.headless === 'true'
    var devtools = headless
    const browser = await puppeteer.launch({ headless, devtools });
    var [page] = await browser.pages();
    await page.setViewport({ width: 1600, height: 700 });
    await page.goto("https://www.ironman.com/races")
}
module.exports = loadAllIMEvents