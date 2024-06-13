
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

module.exports.resultsSummary = async (req, res) => {
    resultsSummary = await ImResult.aggregate([

        { $match: { totalTime: { $ne: "00:00:00" } } },
        { $sort: { totalTime: 1 } },
        {
            $group: {
                _id: "$division",
                winner: { $first: "$fullName" },
                time: { $first: "$totalTime" },
                count: { $count: {} }
            }
        }
    ], { collation: { locale: "en_US", numericOrdering: true } })
    console.log(resultsSummary)
    res.send(resultsSummary)
}

module.exports.bikevsrun = async (req, res) => {
    console.log("in bike/run")
    res.render('bikevsrun.ejs')
}




// db.imresults.aggregate([
//     { $match: { division: "MPRO" } },
//     { $match: { totalTime: { $ne: "00:00:00" } } },
//     { $sort: { totalTime: 1 } },

// ], { collation: { locale: "en_US", numericOrdering: true } })