const express = require('express')
const router = express.Router()
const hotelControllers = require('./hotelController');
const uploads = require('../../utility/utils')

router.post('/profile', uploads.uploadPhoto, hotelControllers.profile);

module.exports = router;