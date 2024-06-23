const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ImResult = require('./imresult')

const RaceEventSchema = new Schema({
    name: String,
    year: Number,
    date: Date,
    url: String,
    type: {
        type: String,
        enum: ['Triathlon']
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
    }

})

module.exports = mongoose.model('RaceEvent', RaceEventSchema)