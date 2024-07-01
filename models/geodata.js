const mongoose = require('mongoose')
const Schema = mongoose.Schema




const geoDataSchema = new Schema({
    location: {
        type: String,
        required: true
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
})

module.exports = mongoose.model('geoData', geoDataSchema)