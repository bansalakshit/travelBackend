const mongoose = require('mongoose')
const Schema = mongoose.Schema
const flightSchema = new Schema({
    hotelName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    file: {
        type: String
    }
})

module.exports = mongoose.model('hotel' , flightSchema);