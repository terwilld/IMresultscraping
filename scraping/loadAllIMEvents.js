const puppeteer = require('puppeteer')
const mongoose = require('mongoose');
require('dotenv').config()
const ImRace = require('../models/imRace.js')
const RaceEvent = require('../models/raceEvent.js')
const morgan = require('morgan')
const logger = require('../logger.js')
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadAllIMEvents() {
    //console.log("Inside loading all events")


    console.log("Running get All Events")
    logger.info("Running Get all Events")
    const raceLinks = await getAllEvents()
    //  Gathers an array of all urls for all races
    //  Each of these races has lots of years / events ; arr => eg.
    // [
    //     'https://www.ironman.com/im703-finland',
    // 'https://www.ironman.com/im703-les-sables-dolonne',
    //     ...
    // ]




    await updateRaces(raceLinks)
    // Convert the above structure to insert entries for races
    // { url: 'https://www.ironman.com/im703-gdynia',
    //             distance: '70.3', }
    //  The distances will be a guess, each of the events is actually open to change.
    //   Race events will default to their parent value, but it cna be changed

    console.log("Post race updates")
    logger.info("The races have been inserted")


    await setRaceEvents()
}

async function setRaceEvents() {
    console.log("Running set race events")
    const races = await ImRace.find({})
        .sort([['lastRaceEventsPopulated', 1]])
    //    db.imraces.aggregate([{ $sort: { lastRaceEventsPopulated: -1 } }])
    var headless = process.env.headless === 'true'
    var devtools = (!headless)

    for (const race of races) {
        var start = Date.now();
        //Moved browser launching and closing inside the loop so there is a new browser
        // Each time.  Need to clear the browser memory I think
        const browser = await puppeteer.launch({ headless, devtools });
        var [page] = await browser.pages();
        await page.setViewport({ width: 1600, height: 700 });
        await page.goto("https://www.ironman.com/races", { timeout: 0 })
        await page.waitForSelector('#onetrust-accept-btn-handler')
        await page.click('#onetrust-accept-btn-handler')    //  Accept cookies
        console.log(`Starting to populate races for : ${race.url}`)
        logger.info(`Starting to populate races for : ${race.url}`)
        try {
            let resObject = await extractRacePageURLs(race, page)
            //  ^^ return { 'urls': listOfURLs, 'years':listOfYears}{}

            var insertedDocuments = await createRaceEvents(race, resObject)
            race.lastRaceEventsPopulated = Date.now()
            race.scrapeEventLinksSuccessful = true
            await race.save()
            await browser.close()
            var delta = (Date.now() - start) / 1000
            //console.log(`This race is completed and took ${delta} seconds`)
            logger.info(`This race ${race.url}is completed and took ${delta} seconds.  ${insertedDocuments} documents were inserted into raceevents`)
        } catch (e) {
            console.log("This race is failed")
            logger.error("This race is failed")
            logger.error(e)
            race.scrapeEventLinksSuccessful = false
            race.lastRaceEventsPopulated = Date.now()
            await race.save()
            console.log(race)
            await browser.close()
            console.log(e)
        }

    }

}

async function createRaceEvents(race, responseObject) {
    //console.log("Inside create Race Event")

    //console.log(responseObject)
    urls = responseObject.urls
    years = responseObject.years
    // console.log(years)
    // console.log(urls)
    // console.log(years.length)
    // console.log(urls.length)
    //console.log(race)
    var countOfDocs = 0
    if (responseObject.years.length != responseObject.urls.length) {
        console.log("We have a problem This will possibly create an unhandled exception")

    } else {
        for (let i = 0; i < years.length; i++) {
            if (urls[i]) {
                url = urls[i]
                year = years[i]
                type = 'Triathlon'
                // if (year.includes("Bike-Run") || year.includes("Bike & Run") || year.includes("Bike&Run")) {
                if (year.includes("Bike") & year.includes("Run")) {
                    console.log("This contains Bike run")
                    type = 'Biathlon'
                    year = year.split(" ")[0]
                }
                if (year.includes("Sprint")) {
                    type = 'Sprint'
                    year = year.split(" ")[0]

                }

                if (year.includes("Age Group")) {
                    year = year.split(" ")[0]
                }
                if (year.includes("Pro")) {
                    year = year.split(" ")[0]
                }

                year = year.replace(":", "")

                doc = await RaceEvent.findOne({ scrapeURL: url })
                if (!doc) {
                    console.log("No document!")
                    newRaceEvent = new RaceEvent({ scrapeURL: url, url: race.url, year, type, completed: false, name: race.location, parentRace: race })
                    await newRaceEvent.save()
                    countOfDocs += 1
                }
            }

        }
    }
    console.log("End of race events")
    return countOfDocs
    await sleep(100)
}

async function extractRacePageURLs(race, page) {
    //console.log(race)
    //console.log(page)
    await page.goto(race.url, { timeout: 0 })

    await updateRaceInfo(page, race)

    let resultPage = await page.evaluate(async () => {
        return document.querySelectorAll('.leftNav> a')[5].href
    })
    //console.log(resultPage)
    await page.goto(resultPage, { timeout: 0 })
    //console.log("At result Page")

    listOfYears = await getListOfYears(page)

    listOfURLs = []
    for (const year of listOfYears) {
        //console.log("starting the await click year")
        //console.log(year)
        yearURL = await clickYear(page, year)

        listOfURLs.push(yearURL)
    }
    //yearURL = await clickYear(page, listOfYears[0])

    //var iFrameLink = await clickYear(page, currentRace.year)
    await sleep(20)
    return { 'urls': listOfURLs, 'years': listOfYears }

}

async function updateRaceInfo(page, race) {
    //console.log("Inside update race event function")
    await race.save()
    //console.log(page)
    //console.log(race)
    try {
        page.waitForSelector('div.textBlockElement.clearfix.heroSlidetext > div > h2')
    } catch (e) {
        await sleep(2000)
        logger.error("Failed to wait for selector this was caught")
    }
    const pageInfo = await page.evaluate(async () => {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        console.log('In Page Sleep')
        //location = document.querySelector("div.textBlockElement.clearfix.heroSlidetext > div > h2").innerText
        //console.log(location)
        //date = document.querySelector("#yieldContent > div.race-page-top > div.layoutContainer.row.layout-100.full-width.hero-slider > span.race-date-container").innerText
        //console.log(date)
        console.log("In the wait")
        countElements = document.querySelectorAll("div.textBlockElement.clearfix.heroSlidetext > div > h2").length
        console.log(countElements)
        await sleep(100)
        return {
            'location': document.querySelectorAll("div.textBlockElement.clearfix.heroSlidetext > div > h2")[countElements - 1].innerText,
            'date': document.querySelector("#yieldContent > div.race-page-top > div.layoutContainer.row.layout-100.full-width.hero-slider > span.race-date-container").innerText
        }
    });
    race.location = pageInfo.location
    race.dateString = pageInfo.date
    await race.save()
    splitLocation = race.location.split(',')
    splitLocationLen = splitLocation.length
    if (splitLocationLen == 2) {
        race.city = splitLocation[0]
        race.country = splitLocation[1].trim()
    }
    if (splitLocationLen == 3) {
        race.country = splitLocation[2].trim()
        race.city = splitLocation[0].conct(splitLocation[1])
    }
    await race.save()
    await sleep(10)
}
async function getListOfYears(page) {
    //console.log("Inside get list of years")
    //console.log(page)
    const url = await page.evaluate(() => document.location.href);
    try {
        listOfYears = await page.evaluate(async () => {
            listOfYears = []
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            //There are two chunks of years - select the first.  Second is listed years for other results
            topSelector = document.querySelectorAll('.pageElement >.contentTabs')[0]
            //Find the span which has a value matching the year of the event we are looking for
            allSpans = topSelector.querySelectorAll('li >span')
            for (const span of allSpans) {
                console.log("This might be  year")
                console.log(span.innerText)
                listOfYears.push(span.innerText)
            }
            return listOfYears
        })
    }
    catch (error) {
        console.log(error)
        console.log(`Error occured on : ${url}`)
    }

    return listOfYears

}
async function extractIFrame(page) {
    //console.log('inside Extract Iframe')
    var result = await page.evaluate(() => {
        // Find the iframe for the lab - but the first, not the "open compeditor"
        //  This is a search iframe
        frames = document.querySelectorAll('iframe')
        console.log(frames)
        for (i = 0; i < frames.length; ++i) {
            if (frames[i].src.includes("labs.competitor.com")) {
                if (!(frames[i].src.includes("opendivision"))) {
                    console.log("found it")
                    console.log(frames[i].src)
                    return frames[i].src
                }
            }
        }
    });
    return result
}

async function clickYear(page, year) {
    await page.setRequestInterception(true)
    correct_url = null
    page.on('request', (request) => {
        if (request.interceptResolutionState().action === "already-handled") return;

        const request_url = request.url();
        if (request_url.startsWith("https://labs.competitor.com/result/subevent/")) {
            //console.log(request_url)
            //console.log("URL Starts with:")
            correct_url = request_url
        }
        //console.log(request_url)
        request.continue();
    });

    await page.evaluate(async (year) => {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        //There are two chunks of years - select the first.  Second is listed years for other results
        topSelector = document.querySelectorAll('.pageElement >.contentTabs')[0]
        //Find the span which has a value matching the year of the event we are looking for
        allSpans = topSelector.querySelectorAll('li >span')
        for (const span of allSpans) {
            if (span.innerText == year) {

                console.log("About to wait 20 seconds then click")
                await sleep(4000)
                await span.click()
            }
        }

        console.log('sleeping for 10')
        await sleep(4000)
    }, year)

    if (correct_url == null) {
        correct_url = await extractIFrame(page)
        //console.log("About to return this value{below}")
        //console.log(correct_url)
        return correct_url
    }
    //console.log("About to return this value{below}")
    // remove /opendivision
    correct_url = correct_url.replace(/\/opendivision/g, '');
    return correct_url
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
        //console.log(`Need to click page: ${ currentPageNumber }`);
        await page.evaluate(async (currentPageNumber) => {
            //console.log(currentPageNumber)
            // countOfPages = document.querySelectorAll(".pageButtons > .pageNumber").length
            // https://stackoverflow.com/questions/37081721/use-variables-in-document-queryselector
            currentButton = document.querySelector((".pageButtons >." + CSS.escape(currentPageNumber)))
            await currentButton.click()
        }, currentPageNumber)
        //await page.waitForSelector('.pageButtons')
        //document.querySelectorAll('.race-result-list > .race-card')
        await page.waitForSelector('.race-result-list > .race-card > .race-info > .race-info-details > .race-details-right')
        await sleep(500)
        //console.log("DERP")
        var thisPageLinks = await page.evaluate(async () => {
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            raceCards = document.querySelectorAll('.race-result-list > .race-card')
            raceURLs = []
            //location = ''
            for (let race = 0; race < raceCards.length; race++) {

                raceURLs.push(raceCards[race].querySelector('.race-details-right > a').href)
                //console.log(raceCards[race].querySelector('.race-details-right > a').href)
                //raceCards[0].querySelector('.race-info>.race-info-details> .details-left')

                console.log("At big sleep in cards")
                // await sleep(200)
                //console.log(raceCards[race].querySelector('.race-info>.race-info-details> .details-left >.race-location').innerText)
                //location = raceCards[race].querySelector('.race-info > .race-info-details > .details-left > .race-location')
                //location = raceCards[race].querySelector('.race-info>.race-info-details> .details-left >.race-location').innerText
                // console.log("TEST PRE LOG")
                // await sleep(20)
                //console.log(location)
                // console.log("TEST")
                await sleep(20)
            }
            return raceURLs

        })
        pageLinks = pageLinks.concat(thisPageLinks)
        //console.log(`Clicked on page ${ currentPageNumber }`)
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