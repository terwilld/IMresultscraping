const express = require('express')
const router = express.Router();
const index = require('../controllers/index.js')

router.get('/', index.index)

router.get('/results', index.results)

router.get('/bikevsrun', index.bikevsrun)

router.get('/resultsSummary', index.resultsSummary)

module.exports = router;