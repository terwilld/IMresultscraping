const puppeteer = require('puppeteer')
const mongoose = require('mongoose');
require('dotenv').config()
const ImRace = require('../models/imRace.js')
const RaceEvent = require('../models/raceEvent.js')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadAllIMEvents() {
    //console.log("Inside loading all events")


    const raceLinks = await getAllEvents()
    await updateRaces(raceLinks)



    //await setRaceEvents()

}

async function setRaceEvents() {
    console.log("Running set race events")
    const races = await ImRace.find({})
    var headless = process.env.headless === 'true'
    var devtools = (!headless)
    const browser = await puppeteer.launch({ headless, devtools });
    var [page] = await browser.pages();
    await page.setViewport({ width: 1600, height: 700 });
    await page.goto("https://www.ironman.com/races")
    await page.waitForSelector('#onetrust-accept-btn-handler')
    await page.click('#onetrust-accept-btn-handler')    //  Accept cookies
    //console.log(races)
    for (const race of races) {
        //console.log(race)
        await extractRacePage(race, page)
    }

}
async function extractRacePage(race, page) {
    console.log(race)
    console.log(page)
    await page.goto(race.url, { timeout: 0 })
    console.log("At the page")
    let resultPage = await page.evaluate(async () => {
        //console.log(currentPageNumber)
        // countOfPages = document.querySelectorAll(".pageButtons > .pageNumber").length
        // https://stackoverflow.com/questions/37081721/use-variables-in-document-queryselector
        //currentButton = document.querySelector((".pageButtons >." + CSS.escape(currentPageNumber)))
        return document.querySelectorAll('.leftNav> a')[5].href
    })
    console.log(resultPage)
    await page.goto(resultPage, { timeout: 0 })
    console.log("At result Page")
    await sleep(2000000)


}


async function getAllEvents() {
    console.log("Get all events")
    //https://www.ironman.com/races
    var headless = process.env.headless === 'true'
    var devtools = (!headless)
    const browser = await puppeteer.launch({ headless, devtools });
    var [page] = await browser.pages();
    await page.setViewport({ width: 1600, height: 700 });
    await page.goto("https://www.ironman.com/races")
    await page.waitForSelector('#onetrust-accept-btn-handler')
    await page.click('#onetrust-accept-btn-handler')    //  Accept cookies
    const countOfPages = await getCountOfPages(page)
    const raceLinks = await iterateThroughPages(page, countOfPages)
    await browser.close()
    return raceLinks
}


async function updateRaces(raceLinks) {
    for (const race of raceLinks) {
        doc = await ImRace.findOne({ url: race })
        if (!doc) {
            //var newImResult = new ImResult(result)
            //console.log("Needs to be inserted")
            var newImRace = new ImRace({ url: race })
            if (race.includes("703")) {
                newImRace.distance = '70.3'
            } else if (race.includes("5150")) {
                newImRace.distance = '5150'
            } else {
                newImRace.distance = '140.6'
            }
            await newImRace.save()
        }
    }
}


async function iterateThroughPages(page, countOfPages) {
    pageLinks = []
    for (let currentPageNumber = 1; currentPageNumber < countOfPages + 1; currentPageNumber++) {
        //console.log(`Need to click page: ${currentPageNumber}`);
        await page.evaluate(async (currentPageNumber) => {
            //console.log(currentPageNumber)
            // countOfPages = document.querySelectorAll(".pageButtons > .pageNumber").length
            // https://stackoverflow.com/questions/37081721/use-variables-in-document-queryselector
            currentButton = document.querySelector((".pageButtons >." + CSS.escape(currentPageNumber)))
            await currentButton.click()
        }, currentPageNumber)
        //await page.waitForSelector('.pageButtons')
        //document.querySelectorAll('.race-result-list > .race-card')
        await page.waitForSelector('.race-result-list')
        var thisPageLinks = await page.evaluate(async () => {
            raceCards = document.querySelectorAll('.race-result-list > .race-card')
            raceURLs = []

            for (let race = 0; race < raceCards.length; race++) {

                raceURLs.push(raceCards[race].querySelector('.race-details-right > a').href)
            }
            return raceURLs

        })
        pageLinks = pageLinks.concat(thisPageLinks)
        //console.log(`Clicked on page ${currentPageNumber}`)
        await sleep(200)
    }
    // console.log(pageLinks)
    // console.log(pageLinks.length)
    return pageLinks
}


async function getCountOfPages(page) {

    //    document.querySelectorAll(".pageButtons > .pageNumber")
    // Get the count of how many pages need to be scraped.
    await page.waitForSelector('.pageButtons')
    const countOfPages = await page.evaluate(async () => {

        countOfPages = document.querySelectorAll(".pageButtons > .pageNumber").length
        return countOfPages
    })
    return countOfPages
}






module.exports = loadAllIMEvents