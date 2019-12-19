const user = require('./components/user/userRoutes');
const home = require('./components/home/homeRouter');
const flight = require('./components/flight/flightRoutes');
const hotel = require('./components/hotel/hotelRoutes');

module.exports = function (app) {
    console.log("initiallizing routes")
    app.use('/api/v1/user', user);
    app.use('/api/v1/home', home);
    app.use('/api/v1/flight', flight);
    app.use('/api/v1/hotel', hotel);
}
