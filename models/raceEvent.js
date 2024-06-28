const mongoose = require('mongoose');
const ImRace = require('./imRace')
const Schema = mongoose.Schema;
const ImResult = require('./imresult')

const RaceEventSchema = new Schema({
    name: String,
    // year: Number,
    year: String,
    date: Date,
    url: String,
    type: {
        type: String,
        enum: ['Triathlon', 'Biathlon']
    },
    completed: {
        type: Boolean,
        default: false
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "ImResult"
    }],
    scrapeURL: {
        type: String,
        default: null
    },
    parentRace: {
        type: Schema.Types.ObjectId,
        ref: "ImRace"
    },
    scrapeFailed: {
        type: Boolean
    },
    distance: {
        type: String,
        enum: ['140.6', '70.3', '5150', 'Sprint']
    }

})

module.exports = mongoose.model('RaceEvent', RaceEventSchema)