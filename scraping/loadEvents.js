const mongoose = require('mongoose');
const RaceEvent = require('../models/raceEvent.js')


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
            completed: false
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
            completed: false
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
            completed: false
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
            completed: false
        })
        res = await newRace.save()
        //console.log(res)
    }

    await sleep(1000)
}


// campgrounds = await Campground.find({})
//     .populate('author')

module.exports = loadEvents



