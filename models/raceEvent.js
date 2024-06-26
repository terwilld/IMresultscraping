const mongoose = require('mongoose');
const ImRace = require('./imRace')
const Schema = mongoose.Schema;
const ImResult = require('./imresult')

const RaceEventSchema = new Schema({
    name: String,
    year: Number,
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
    }

})

module.exports = mongoose.model('RaceEvent', RaceEventSchema)