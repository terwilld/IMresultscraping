const puppeteer = require('puppeteer')
const mongoose = require('mongoose');
const RaceEvent = require('../models/raceEvent.js')
const ImResult = require('../models/imresult.js')
const request_client = require('request-promise-native');
require('dotenv').config()
const logger = require('../logger.js')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeIM3() {
    console.log("I'm in im scrape 3")
    // https://www.ironman.com/im703-western-massachusetts
    IMraces = await RaceEvent.find({ completed: false })
    // url: 'https://www.ironman.com/im703-western-massachusetts'
    //IMraces = await RaceEvent.find({ completed: false, url: 'https://www.ironman.com/im703-western-massachusetts' })
    // IMraces = await RaceEvent.find({})
    //console.log(IMraces)
    for (const IMrace of IMraces) {
        // console.log(IMrace);
        console.log('this is my current race')
        currentRace = await RaceEvent.findOne({ _id: IMrace._id })

        console.log(currentRace)
        //await scrapeAWholeIMRace(currentRace)
        await scrapeAWholeIMRace2(currentRace)
    }
}

async function scrapeAWholeIMRace2(currentRace) {
    var headless = process.env.headless === 'true'
    var devtools = (!headless)
    console.log(`headless: ${headless}, devtools: ${devtools}`)
    const browser = await puppeteer.launch({ headless, devtools });
    var [page] = await browser.pages();
    await page.setViewport({ width: 1600, height: 700 });
    try {

        var iFrameLink = currentRace.scrapeURL
        partialIframeLink = iFrameLink
        console.log(iFrameLink)
        iFrameLink = iFrameLink + '?filter=%7B%7D&order=ASC&page=1&perPage=200&sort=FinishRankOverall'
        console.log(iFrameLink)

        await page.goto(iFrameLink, {
            timeout: 0,
            waitUntil: ["domcontentloaded", "networkidle2"],
        });

        const maxPage = await calculateMaxPage(page)
        console.log(`Max page is: ${maxPage}`)
        await sleep(100)

        var currentPageResults = await getPageResults(page)
        console.log("Trying to insert results")
        // console.log(currentPageResults)
        try {
            insertUpdates(currentPageResults, currentRace)
        } catch (e) {
            console.log(e)
        }
        await scrapeRemainingPages(page, partialIframeLink, maxPage, currentRace)


        currentRace.completed = true
        await currentRace.save()

        console.log("Post update and save^^")
        await browser.close()

        await sleep(10)
    } catch (e) {
        currentRace.scrapeFailed = true
        await currentRace.save()
        await browser.close()

    }

}


async function scrapeAWholeIMRace(currentRace) {
    try {
        var headless = process.env.headless === 'true'
        var devtools = (!headless)
        console.log(`headless: ${headless}, devtools: ${devtools}`)
        const browser = await puppeteer.launch({ headless, devtools });
        var [page] = await browser.pages();
        await page.setViewport({ width: 1600, height: 700 });
        await page.goto(currentRace.url);                   //Go to the main url for this location.  Multiple years of results here
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 0 })
        await page.click('#onetrust-accept-btn-handler', { timeout: 0 })    //  Accept cookies
        // console.log("waiting done")


        //  Find the tab within this page corresponding to the year we want.
        // console.log(currentRace.year)

        var iFrameLink = await clickYear(page, currentRace.year)
        console.log("New URL")
        await sleep(500)
        console.log('Post sleep for 20 seconds')

        await sleep(500)
        partialIframeLink = iFrameLink
        iFrameLink = iFrameLink + '?filter=%7B%7D&order=ASC&page=1&perPage=200&sort=FinishRankOverall'

        if (!currentRace.scrapeURL) {
            console.log("Add the scrape url")
            currentRace.scrapeURL = iFrameLink
            await currentRace.save()

        }
        await page.goto(iFrameLink, {
            timeout: 20 * 1000,
            waitUntil: ["domcontentloaded", "networkidle2"],
        });
        const maxPage = await calculateMaxPage(page)
        console.log(`Max page is: ${maxPage}`)
        await sleep(100)
        var currentPageResults = await getPageResults(page)

        insertUpdates(currentPageResults, currentRace)
        await scrapeRemainingPages(page, partialIframeLink, maxPage, currentRace)
        console.log("Done Race!")

        currentRace.completed = true
        await currentRace.save()

        console.log("Post update and save^^")
        await browser.close()
        console.log("Browser is closed")
    } catch (e) {
        currentRace.scrapeFailed = true
        await currentRace.save()
        await browser.close()

    }
}



async function scrapeRemainingPages(page, partialIframeLink, maxPage, currentRace) {
    for (let i = 2; i < maxPage + 1; i++) {
        console.log("This is my new page:")
        fullNewURL = partialIframeLink + '?filter=%7B%7D&order=ASC&page=' + i + '&perPage=200&sort=FinishRankOverall'
        console.log(fullNewURL)
        await page.goto(fullNewURL, {
            timeout: 0,
            waitUntil: ["domcontentloaded", "networkidle2"],
        });
        console.log(`network idle on page: ${fullNewURL}`)

        var currentPageResults = await getPageResults(page)
        try {
            insertUpdates(currentPageResults, currentRace)
        } catch (e) {
            console.log(e)
        }
    }
}


async function insertUpdates(results, currentRace) {
    // console.log("These are my results")
    // console.log(currentRace)
    // console.log("^^This is my current race")
    logger.info("About to insert results")

    try {
        var inserts = 0
        var notInserted = 0
        console.log("About to do the inserts")
        // const insertsTotal = results.reduce(async (resObject, result) => {
        //     doc = await ImResult.findOne({ fullName: result.fullName, event: currentRace.id, totalTime: result.totalTime })
        //     if (!doc) {
        //         //console.log("Need to write this document")
        //         result.overallRank = result.overallRank.replace(",", "")  // remove comma from number
        //         result.genderRank = result.genderRank.replace(",", "")
        //         result.divRank = result.divRank.replace(",", "")
        //         result.bib = parseInt(result.bib)
        //         var newImResult = new ImResult(result)
        //         newImResult.event = currentRace
        //         //console.log(newImResult)
        //         await newImResult.save()
        //         // console.log(currentRace)
        //         // console.log('^^ current race')
        //         resObject.inserts += 1

        //     } else {
        //         //console.log("Document Already Exists matching event, name and time")
        //         resObject.notInserted += 1
        //         notInserted = notInserted + 1
        //     }
        //     console.log(resObject)
        //     // resObject.inserts += 1
        //     // resObject.notInserted += 2
        //     return resObject
        // }, { inserts: 0, notInserted: 0 })
        // console.log(" inerst total")
        // console.log(insertsTotal)
        // console.log("  ^   insert total")
        var preCount = await ImResult.countDocuments({})
        // console.log(preCount)
        // console.log("this is my pre-count")
        for (let step = 0; step < results.length; step++) {
            result = results[step]
            //console.log(result)
            doc = await ImResult.findOne({ fullName: result.fullName, event: currentRace.id, totalTime: result.totalTime })
            if (!doc) {
                //console.log("Need to write this document")
                result.overallRank = result.overallRank.replace(",", "")  // remove comma from number
                result.genderRank = result.genderRank.replace(",", "")
                result.divRank = result.divRank.replace(",", "")
                result.bib = parseInt(result.bib)
                var newImResult = new ImResult(result)
                newImResult.event = currentRace
                //console.log(newImResult)
                await newImResult.save()
                // console.log(currentRace)
                // console.log('^^ current race')
                inserts = inserts + 1
                //console.log(`Inserted: ${inserts}`)
            } else {
                //console.log("Document Already Exists matching event, name and time")
                notInserted = notInserted + 1
                //console.log(`Not inserted: ${notInserted}`)
            }
            //console.log(`step: ${step} of total: ${results.length}`)
        }
        var postCount = await ImResult.countDocuments({})
        logger.info(`Partially processed: ${currentRace.url}. Scrape URL: ${currentRace.scrapeURL}.  ${inserts} documents inserted.  ${notInserted} documents not inserted
        Precount is: ${preCount} Post count is: ${postCount}`)


        // results.forEach(async (result) => {
        //     console.log(result)
        //     doc = await ImResult.findOne({ fullName: result.fullName, event: currentRace.id, totalTime: result.totalTime })
        //     if (!doc) {
        //         //console.log("Need to write this document")
        //         result.overallRank = result.overallRank.replace(",", "")  // remove comma from number
        //         result.genderRank = result.genderRank.replace(",", "")
        //         result.divRank = result.divRank.replace(",", "")
        //         result.bib = parseInt(result.bib)
        //         var newImResult = new ImResult(result)
        //         newImResult.event = currentRace
        //         //console.log(newImResult)
        //         await newImResult.save()
        //         // console.log(currentRace)
        //         // console.log('^^ current race')
        //         inserts = inserts + 1
        //         console.log(`Inserted: ${inserts}`)
        //     } else {
        //         //console.log("Document Already Exists matching event, name and time")
        //         notInserted = notInserted + 1
        //         console.log(`Not inserted: ${notinserted}`)
        //     }
        // })
        // logger.info(`Partially processed: ${currentRace.url}. Scrape URL: ${currentRace.scrapeURL}.  ${inserts} documents inserted.  ${notInserted} documents not inserted`)

    } catch (e) {
        console.log(e)
    }

}


async function getPageResults(page) {
    await sleep(1000)
    await page.waitForSelector('tbody > tr')
    await sleep(10)
    await page.waitForSelector('td >span')
    const expandableButtons = await page.evaluate(async () => {
        // Each row is one result.  Each needs to be expanded.
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await sleep(50)
        results = []
        currentRows = document.querySelectorAll('tbody > tr')
        for (i = 0; i < currentRows.length; i++) {
            // for (i = 0; i < 1; i++) {
            currentRow = currentRows[i]
            currentData = Array.from(currentRow.querySelectorAll('td >span')).map(x => x.innerText)
            newResultObject = {
                'fullName': currentData[0],
                'country': currentData[1],
                'divRank': currentData[2],
                'genderRank': currentData[3],
                'overallRank': currentData[4],  //To remove 1,000 => 1000 for div rank
                'swimTime': currentData[5],
                'bikeTime': currentData[6],
                'runTime': currentData[7],
                'totalTime': currentData[8],
                'points': currentData[9],
                'designation': null
            }


            expandButton = currentRows[i].cells[0]
            await expandButton.click();


            resultContainer = document.querySelector('.resultContainer')
            rankSummary = resultContainer.querySelectorAll('.rankSum >.wrapper>.text')
            //console.log(resultContainer)
            //console.log(rankSummary)


            for (let i = 0; i < rankSummary.length; i++) {
                designation = rankSummary[i].querySelector('.rankText')
                //console.log(designation)

                // await new Promise(function (resolve) {
                //     setTimeout(resolve, 500000)
                // });
                try {
                    if (designation.innerText == 'DESIGNATION') {
                        //console.log(`About to break? rank summary: ${i}`)
                        //console.log(designation.innerText)

                        result = rankSummary[i].querySelector('.rankNum').innerText

                        newResultObject.designation = result

                    }
                } catch (e) {
                }
            }


            await new Promise(function (resolve) {
                setTimeout(resolve, 50)
            });
            //console.log(resultContainer)
            genInfo = resultContainer.querySelectorAll('.genInfo > .table > .tableFooter >.wrapper >.text')
            //console.log(genInfo)
            newResultObject.bib = genInfo[0].innerText
            newResultObject.division = genInfo[1].innerText
            newResultObject.points = genInfo[3].innerText
            transitions = resultContainer.querySelectorAll('#transitions >.table> .tableFooter > .wrapper >.text')
            newResultObject.T1 = transitions[0].innerText
            newResultObject.T2 = transitions[1].innerText
            results.push(newResultObject)
            await expandButton.click();
        }
        return results

    })
    return expandableButtons
}


async function calculateMaxPage(page) {
    const maxPage = await page.evaluate(() => {
        // Get the biggest page link from the current iFrame.
        // Load 200 people per iframe.  This is the max the iframe will return.

        bottomNavLis = document.querySelectorAll('.MuiPagination-ul > li > button')
        innerTexts = Array.from(document.querySelectorAll('.MuiPagination-ul > li > button')).map(x => x.innerText)
        biggestPage = parseInt(innerTexts[innerTexts.length - 2])
        console.log(biggestPage)
        return biggestPage
    })
    return maxPage
}

async function extractIFrame(page) {
    console.log('inside Extract Iframe')
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
        // Your custom logic here
        const request_url = request.url();

        if (request_url.startsWith("https://labs.competitor.com/result/subevent/")) {
            console.log(request_url)
            console.log("URL Starts with:")
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
                await sleep(1000)
                await span.click()
            }
        }

        console.log('sleeping for 10')
        await sleep(1000)

    }, year)

    if (correct_url == null) {
        correct_url = await extractIFrame(page)
        console.log("About to return this value{below}")
        return correct_url
    }
    console.log("About to return this value{below}")
    return correct_url
}

module.exports = scrapeIM3


//      /public/results/subevent/agegroups/F1D7FBF8-7BD7-44CF-BD37-9492D1EDDC1E
//https://labs.competitor.com/result/subevent/F1D7FBF8-7BD7-44CF-BD37-9492D1EDDC1E

//https://labs.competitor.com/result/subevent/D8DF0B33-0809-4507-BCBC-611067A517CA
//https://labs.competitor.com/result/subevent/811402C9-91A1-4EBB-B102-E083A44876E7

//      // iFrameLink = iFrameLink + '?filter=%7B%7D&order=ASC&page=1&perPage=200&sort=FinishRankOverall'