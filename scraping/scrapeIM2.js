const puppeteer = require('puppeteer')
const mongoose = require('mongoose');
const RaceEvent = require('../models/raceEvent.js')
const ImResult = require('../models/imresult.js')
require('dotenv').config()

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeIM2() {
    console.log("Test in function ScrapeIM2")
    console.log(process.env.headless)
    var headless = process.env.headless === 'true'
    console.log(`Is this headless: ${headless}`)
    // const browser = await puppeteer.launch({ headless: false, devtools: true });
    const browser = await puppeteer.launch({ headless });

    //setTimeout(() => { console.log('50 seconds passed'); }, 50000);
    races = await RaceEvent.find({})
    console.log("Races")
    console.log(races)
    console.log('presleep')
    await sleep(10000)
    console.log("browser launched")
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 700 });
    await page.goto("https://www.ironman.com/im-florida-results");
    console.log("idle")

    await page.click('#onetrust-accept-btn-handler')
    console.log("waiting done")

    var resultIframe = await page.evaluate(() => {
        // Find the iframe for the lab - but the first, not the "open compeditor"
        //  This is a search iframe
        frames = document.querySelectorAll('iframe')
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


    partialIframeLink = resultIframe
    resultIframe = resultIframe + '?filter=%7B%7D&order=ASC&page=1&perPage=200&sort=FinishRankOverall'
    await page.goto(resultIframe, {
        timeout: 20 * 1000,
        waitUntil: ["domcontentloaded", "networkidle2"],
    });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    console.log("network idle")
    //https://labs.competitor.com/result/subevent/811402C9-91A1-4EBB-B102-E083A44876E7?filter=%7B%7D&order=ASC&page=1&perPage=10000&sort=FinishRankOverall


    const maxPage = await page.evaluate(() => {
        // Get the biggest page link from the current iFrame.
        // Load 200 people per iframe.  This is the max the iframe will return.

        bottomNavLis = document.querySelectorAll('.MuiPagination-ul > li > button')
        innerTexts = Array.from(document.querySelectorAll('.MuiPagination-ul > li > button')).map(x => x.innerText)
        biggestPage = parseInt(innerTexts[innerTexts.length - 2])
        console.log(biggestPage)
        return biggestPage
    })
    await new Promise(function (resolve) {
        setTimeout(resolve, 1)
    });
    console.log("wait for tables")


    var currentPageResults = await getPageResults(page)
    console.log("Trying to insert results")
    try {
        insertUpdates(currentPageResults)
    } catch (e) {
        console.log(e)
    }

    for (let i = 2; i < maxPage + 1; i++) {
        console.log("This is my new page:")
        fullNewURL = partialIframeLink + '?filter=%7B%7D&order=ASC&page=' + i + '&perPage=200&sort=FinishRankOverall'
        console.log(fullNewURL)
        await page.goto(fullNewURL, {
            timeout: 20 * 10000,
            waitUntil: ["domcontentloaded", "networkidle2"],
        });
        console.log(`network idle on page: ${fullNewURL}`)


        var currentPageResults = await getPageResults(page)
        try {
            insertUpdates(currentPageResults)
        } catch (e) {
            console.log(e)
        }
    }

    console.log("FINISHED!")

}

async function getPageResults(page) {
    const expandableButtons = await page.evaluate(async () => {
        // Each row is one result.  Each needs to be expanded.
        results = []
        currentRows = document.querySelectorAll('tbody > tr')
        for (i = 0; i < currentRows.length; i++) {

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
            console.log(`currently getting result #${newResultObject.overallRank}`)

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
                setTimeout(resolve, 10)
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


async function insertUpdates(results) {
    console.log("These are my results")
    try {
        results.forEach(async (result) => {
            var doc = await ImResult.findOne({ fullName: result.fullName })

            if (!doc) {
                console.log("Need to write this document")
                console.log(result)
                result.overallRank = result.overallRank.replace(",", "")  // remove comma from number
                result.genderRank = result.genderRank.replace(",", "")
                result.divRank = result.divRank.replace(",", "")
                result.bib = parseInt(result.bib)
                var newImResult = new ImResult(result)
                res = await newImResult.save()
            } else {
                //console.log("Document is already found")
                //console.log(result)
            }
        })
    } catch (e) {
        console.log(e)
    }
}

function checkResults() {
    for (let i = 0; i < db.imresults.count(); i++) {
        doc = db.imresults.findOne({ 'overallRank': i })
        if (!doc) {
            console.log(i)
        }
    }
}



module.exports = scrapeIM2