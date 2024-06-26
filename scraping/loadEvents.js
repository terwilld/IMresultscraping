const mongoose = require('mongoose');
const RaceEvent = require('../models/raceEvent.js')
const logger = require('../logger.js')


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function loadEvents() {

    res = await RaceEvent.findOne({ name: "IMFL", year: 2023 })
    if (res == null) {
        console.log("Does not exist created event")
        newRace = new RaceEvent({
            name: "IMFL",
            year: 2023,
            url: "https://www.ironman.com/im-florida-results",
            finished: false,
            type: 'Triathlon',
            completed: false,
            scrapeURL: 'https://labs.competitor.com/result/subevent/811402C9-91A1-4EBB-B102-E083A44876E7?filter=%7B%7D&order=ASC&page=1&perPage=200&sort=FinishRankOverall'
        })
        res = await newRace.save()
        //console.log(res)
        console.log('Ran update for an event')
    }

    res = await RaceEvent.findOne({ name: "IMFL", year: 2022 })
    if (res == null) {
        console.log("Does not exist created event")
        newRace = new RaceEvent({
            name: "IMFL",
            year: 2022,
            url: "https://www.ironman.com/im-florida-results",
            finished: false,
            type: 'Triathlon',
            completed: false,
            scrapeURL: 'https://labs.competitor.com/result/subevent/F1D7FBF8-7BD7-44CF-BD37-9492D1EDDC1E?filter=%7B%7D&order=ASC&page=1&perPage=200&sort=FinishRankOverall'
        })
        res = await newRace.save()

    }

    res = await RaceEvent.findOne({ name: "IMFL", year: 2021 })
    if (res == null) {
        console.log("Does not exist created event")
        newRace = new RaceEvent({
            name: "IMFL",
            year: 2021,
            url: "https://www.ironman.com/im-florida-results",
            finished: false,
            type: 'Triathlon',
            completed: false,
            scrapeURL: 'https://labs.competitor.com/result/subevent/D8DF0B33-0809-4507-BCBC-611067A517CA?filter=%7B%7D&order=ASC&page=1&perPage=200&sort=FinishRankOverall'
        })
        res = await newRace.save()
        //console.log(res)
        console.log('Ran update for an event')
    }

    res = await RaceEvent.findOne({ name: "IMFL", year: 2020 })
    if (res == null) {
        console.log("Does not exist created event")
        newRace = new RaceEvent({
            name: "IMFL",
            year: 2020,
            url: "https://www.ironman.com/im-florida-results",
            finished: false,
            type: 'Triathlon',
            completed: false,
            scrapeURL: 'https://labs.competitor.com/result/subevent/4C54363C-C8FC-E911-A812-000D3A5A1477?filter=%7B%7D&order=ASC&page=1&perPage=200&sort=FinishRankOverall'
        })
        res = await newRace.save()
        //console.log(res)
    }

    await sleep(1000)
}


// campgrounds = await Campground.find({})
//     .populate('author')

module.exports = loadEvents







