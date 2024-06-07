const mongoose = require('mongoose')
const Schema = mongoose.Schema


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
    runSeconds: Number
})

ImResultSchema.post('save', function (doc) {
    //this.firstName = this.fullName.split(' ', 1)[0]
    //this.lastName = this.fullName.split(' ', 2)[1]
    this.firstName = this.fullName.substring(0, this.fullName.indexOf(" "))
    this.lastName = this.fullName.substring(this.fullName.indexOf(" ") + 1)
    tt = this.swimTime.split(":")
    this.swimSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
    tt = this.bikeTime.split(":")
    this.bikeSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
    tt = this.runTime.split(":")
    this.runSeconds = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
    this.save();
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