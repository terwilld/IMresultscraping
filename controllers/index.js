
const ImResult = require('../models/imresult.js')
const RaceEvent = require('../models/raceEvent.js')
module.exports.index = async (req, res) => {

    finishedEvents = await RaceEvent.find({ completed: true })
    console.log(finishedEvents)

    res.render('index.ejs', { axiosURL })
}

module.exports.stackedbar = async (req, res) => {
    res.render('stackedbar.ejs', { axiosURL })

}


module.exports.stackedbarhorizontal = async (req, res) => {
    res.render('stackedbarhorizontal.ejs', { axiosURL })

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