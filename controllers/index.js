
const ImResult = require('../models/imresult.js')

module.exports.index = async (req, res) => {

    //console.log("Test")


    //results = await ImResult.find({});
    //console.log(results)
    //res.send(results)
    console.log(`The axios URL from the controller is: ${axiosURL}`)
    //console.log(axiosURL)
    res.render('index.ejs', { axiosURL })
}

module.exports.results = async (req, res) => {
    results = await ImResult.find({});
    res.send(results)
}

module.exports.bikevsrun = async (req, res) => {
    console.log("in bike/run")
    res.render('bikevsrun.ejs')
}