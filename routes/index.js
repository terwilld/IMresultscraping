const express = require('express')
const router = express.Router();
const index = require('../controllers/index.js')

router.get('/', index.index)

module.exports = router;