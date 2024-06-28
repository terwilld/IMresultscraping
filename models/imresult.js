const mongoose = require('mongoose')
const Schema = mongoose.Schema
const RaceEvent = require('./raceEvent')

const ImResultSchema = new Schema({
    fullName: String,
    firstName: String,
    lastName: String,
    country: String,
    divRank: Number,
    genderRank: Number,
    overallRank: Number,
    swimTime: String,
    swimSeconds: Number,
    bikeTime: String,
    bikeSeconds: Number,
    runTime: String,
    runSeconds: Number,
    totalTime: String,
    totalTimeSeconds: Number,
    bib: Number,
    division: {
        type: String,
        enum: ['Unknown', 'MPRO', 'FPRO',
            'M18-24', 'M25-29', 'M30-34', 'M35-39', 'M40-44', 'M45-49', 'M50-54', 'M55-59', 'M60-64', 'M65-69', 'M70-74', 'M75-79', 'M80-84', 'M85-89',
            'F18-24', 'F25-29', 'F30-34', 'F35-39', 'F40-44', 'F45-49', 'F50-54', 'F55-59', 'F60-64', 'F65-69', 'F70-74', 'F75-79', 'F80-84', 'F85-89',
            'PC/ID', 'PC', 'UNKNOWN', 'MST', 'HC'
        ],
        default: 'Unknown'
    },
    T1: String,
    T2: String,
    isMale: {
        type: Boolean,
        default: null
    },
    designation: String,
    event: {
        type: Schema.Types.ObjectId,
        ref: "RaceEvent"
    }
})

ImResultSchema.pre('save', function (next) {
    //this.firstName = this.fullName.split(' ', 1)[0]
    //console.log("in post save middleware")
    //this.lastName = this.fullName.split(' ', 2)[1]
    this.firstName = this.fullName.substring(0, this.fullName.indexOf(" "))
    this.lastName = this.fullName.substring(this.fullName.indexOf(" ") + 1)
    tt = this.swimTime.split(":")
    this.swimSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
    tt = this.bikeTime.split(":")
    this.bikeSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
    tt = this.runTime.split(":")
    this.runSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
    tt = this.totalTime.split(":")
    this.totalTimeSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
    //console.log(`Is Male?: ${this.isMale}`)
    if (this.division[0] == 'M') {
        this.isMale = true
    } else {
        this.isMale = false
    }
    //console.log(`Is Male?: ${this.isMale}`)


    //this.save();
    next();
});
// ImResultSchema.pre('save', function (doc) {
//     console.log(this.overallRank)
//     tmp = this.overallRank.toString()
//     console.log(tmp)
//     this.overallRank = tmp.replace(",", "")
//     //    this.overallRank = this.overallRank.replace(",", "")
// })

// ImResultSchema.post('findOneAndUpdate', function (doc) {
//     //this.firstName = this.fullName.split(' ', 1)[0]
//     //this.lastName = this.fullName.split(' ', 2)[1]
//     console.log(this)
//     this.firstName = this.fullName.substring(0, this.fullName.indexOf(" "))
//     this.lastName = this.fullName.substring(this.fullName.indexOf(" ") + 1)
//     tt = this.swimTime.split(":")
//     this.swimSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
//     tt = this.bikeTime.split(":")
//     this.bikeSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
//     tt = this.runTime.split(":")
//     this.runSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
//     this.save();
// });



module.exports = mongoose.model('ImResult', ImResultSchema)