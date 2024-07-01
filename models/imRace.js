const mongoose = require('mongoose')
const Schema = mongoose.Schema




const ImRaceSchema = new Schema({
    url: String,
    distance: {
        type: String,
        enum: ['140.6', '70.3', '5150', 'Unknown'],
        default: 'Unknown'
    },
    city: String,
    location: String,
    dateString: String,
    country: String,
    lastRaceEventsPopulated: Date,
    scrapeEventLinksSuccessful: Boolean,
    secondsToCreateRaceEvents: Number,
    locationCoords: {
        type: Schema.Types.ObjectId,
        ref: "geoData"
    }
})

module.exports = mongoose.model('ImRace', ImRaceSchema)