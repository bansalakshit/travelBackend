const express = require('express')
const router = express.Router()
const flightControllers = require('./flightController');

router.post('/pollingResult', flightControllers.pollResult);
router.post('/flightDetails', flightControllers.flightDetails);
router.put('/bookingDetails', flightControllers.bookingDetails);

module.exports = router;