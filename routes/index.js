const express = require('express')
const router = express.Router();
const index = require('../controllers/index.js')

router.get('/', index.index)

router.get('/results', index.results)

router.get('/bikevsrun', index.bikevsrun)

module.exports = router;