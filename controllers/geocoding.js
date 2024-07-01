const NodeGeocoder = require('node-geocoder');
const axios = require('axios');
const mongoose = require('mongoose');
const geoData = require('../models/geodata.js')
const IMRace = require('../models/imRace.js')
//require('dotenv').config()

geoAPI = process.env.googleGeoAPI;

// console.log(geoAPI)

//currentRace = await RaceEvent.findOne({ _id: IMrace._id })


// dbURL = 'mongodb://127.0.0.1:27017/resultscraping';
// secret = 'secret';
// axiosURL = 'http://localhost:3000'

// mongoose.connect(dbURL);
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected by mongoose")
//     console.log(dbURL)
// })


async function populateAllRaces() {
    IMraces = await IMRace.find({})
    for (const race of IMraces) {
        console.log(race.location)
        //

        if (race.location) {
            try {
                res = await getGeoData(race.location)
                //console.log(res)
                race.locationCoords = res
                await race.save()
                //console.log(race)
            } catch (e) {
                console.log("Dirty data")
                console.log(e)
            }
        }

    }
}
async function getGeoData(location) {
    storedLocation = await geoData.findOne({ location: location })
    //console.log(storedLocation)
    //console.log('Stored location^^')
    if (!storedLocation) {
        res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=' + geoAPI)
        //console.log(res.data.results[0].geometry.location)
        const { lat, lng } = res.data.results[0].geometry.location
        //console.log(lat)
        //console.log(lng)
        newgeo = new geoData({
            location: location,
            geometry: {
                type: 'Point',
                coordinates: [lat, lng]
            }
        })
        await newgeo.save()
        //console.log(newgeo)
        return newgeo
    } else {
        //console.log("It is cached")
        //console.log(storedLocation)
        return storedLocation
    }
}


module.exports = getGeoData


// Gdynia, Poland
//getGeoData('Gdynia, Poland')

//populateAllRaces()
// geometry: {
//     type: {
//         type: String, // Don't do `{ location: { type: String } }`
//             enum: ['Point'], // 'location.type' must be 'Point'
//             required: true
//     },
//     coordinates: {
//         type: [Number],
//             required: true
//     }
// }