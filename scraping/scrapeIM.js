const puppeteer = require('puppeteer')
const mongoose = require('mongoose');

const ImResult = require('../models/imresult.js')


async function scrapeIM() {
    const browser = await puppeteer.launch({ headless: false, devtools: true });
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
    await delay(2000)
    console.log("wait for tables")

    var currentPageResults = await getPageResults(page)
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
            timeout: 20 * 1000,
            waitUntil: ["domcontentloaded", "networkidle2"],
        });
        console.log(`network idle on page: ${fullNewURL}`)
        await delay(2000)
        console.log("wait for tables")
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
    console.log("Derp")
    console.log("insdie the function log page: ")
    console.log(page)
    pageResults = page.evaluate(() => {
        currentRows = document.querySelectorAll('tbody > tr')

        results = []
        for (i = 0; i < currentRows.length; i++) {
            current = currentRows[i]
            // currentData = current.querySelectorAll('td >span')
            currentData = Array.from(current.querySelectorAll('td >span')).map(x => x.innerText)
            //console.log(currentData)
            newObject = {
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
            }

            //console.log(newObject)

            results.push(newObject)
        }
        return results
    })
    console.log("About to return results from page")
    //console.log(pageResults)
    return pageResults
}


async function insertUpdates(results) {
    console.log("This are my results")
    //console.log(results)
    try {
        results.forEach(async (result) => {

            var doc = await ImResult.findOne({ fullName: result.fullName })
            //console.log(doc)
            if (!doc) {
                //console.log("Need to write this document")
                result.overallRank = result.overallRank.replace(",", "")  // remove comma from number
                result.genderRank = result.genderRank.replace(",", "")
                result.divRank = result.divRank.replace(",", "")
                var newImResult = new ImResult(result)
                //console.log(newImResult)

                // tmp = newImResult.overallRank
                // console.log(`tmp: ${tmp}`)
                // console.log(`type of tmp: `, typeof (tmp))
                // if (tmp.includes(',')) {
                //     console.log('Contains a comma')  // This should get moved to pre for model
                //     newImResult.overallRank = tmp.replace(",", "")
                // }
                res = await newImResult.save()
                //console.log(res)
            }
        })
    } catch (e) {
        console.log(e)
    }
}


function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}



module.exports = scrapeIM