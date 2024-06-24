const mongoose = require('mongoose')
const Schema = mongoose.Schema




const ImRaceSchema = new Schema({
    url: String,
    distance: {
        type: String,
        enum: ['140.6', '70.3', '5150', 'Unknown'],
        default: 'Unknown'
    },
})

module.exports = mongoose.model('ImRace', ImRaceSchema)