
const ImResult = require('../models/imresult.js')

module.exports.index = async (req, res) => {

    console.log("Test")


    results = await ImResult.find({});
    console.log(results)
    //res.send(results)
    res.render('index.ejs')
}