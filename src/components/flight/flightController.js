const unirest = require('unirest')
const constant = require('../../../config/constants')
const _ = require('lodash')
const flightControllers = {}

flightControllers.pollResult = async (req, res) => {                                         // Create session and poll the result. 
    try {
        const url = `http://partners.api.skyscanner.net/apiservices/pricing/v1.0`;
        const response = await unirest
            .post(url)
            .headers({ 'Content-Type': 'application/x-www-form-urlencoded' })
            .send(req.body)
        const link = `${response.headers.location}?apikey=${constant.productApiKey}`
        const result = await unirest.get(link)
        if (result) res.status(200).send(result)
        else {
            const data = await unirest.get(`${result.headers.location}&apikey=${constant.productApiKey}`)
            res.status(200).send(data)
        }
    } catch (error) {
        console.log(error.message)
        res.status(400).send(error.message)
    }
}

function timeConvert(data) {
    var min = data % 60;
    var h = (data - min) / 60;
    return h + 'h ' + min + 'm';
};

flightControllers.flightDetails = async (req, res) => {
    try {
        const url = `http://partners.api.skyscanner.net/apiservices/pricing/v1.0`;
        const response = await unirest
            .post(url)
            .headers({ 'Content-Type': 'application/x-www-form-urlencoded' })
            .send(req.body)
        const link = `${response.headers.location}?apikey=${constant.productApiKey}`
        const result = await unirest.get(link)
        const responseArray = []
        let inboundObj
        const Itineraries = result.body.Itineraries
        if (Itineraries) {
            for (let value of Itineraries) {
                const outboundData = result.body.Legs.filter(outboundLeg => outboundLeg.Id == value.OutboundLegId)[0]
                const outboundDuration = timeConvert(outboundData.Duration)
                const outboundMap = outboundData.FlightNumbers.map(function mapper(a) {
                    const carrier = result.body.Carriers.filter(carrierDetails => carrierDetails.Id == a.CarrierId)[0]
                    carrierObj = {
                        Id: carrier.Id,
                        Name: carrier.Name,
                        ImageUrl: carrier.ImageUrl
                    }
                    return carrierObj
                })
                const outboundObj = {
                    OutboundLegId: value.OutboundLegId,
                    Departure: outboundData.Departure,
                    Arrival: outboundData.Arrival,
                    Duration: outboundDuration,
                    DurationInMin: outboundData.Duration,
                    Stops: outboundData.Stops,
                    FlightData: outboundMap
                }
                if (req.body.inbounddate) {
                    const inboundData = result.body.Legs.filter(inboundLeg => inboundLeg.Id == value.InboundLegId)[0]
                    const inboundDuration = timeConvert(inboundData.Duration)
                    const inboundMap = inboundData.FlightNumbers.map(function mapper(a) {
                        const carrier = result.body.Carriers.filter(carrierDetails => carrierDetails.Id == a.CarrierId)[0]
                        carrierObj = {
                            Id: carrier.Id,
                            Name: carrier.Name,
                            ImageUrl: carrier.ImageUrl
                        }
                        return carrierObj
                    })
                    inboundObj = {
                        InboundLegId: value.InboundLegId,
                        Departure: inboundData.Departure,
                        Arrival: inboundData.Arrival,
                        Duration: inboundDuration,
                        DurationInMin: inboundData.Duration,
                        Stops: inboundData.Stops,
                        FlightData: inboundMap
                    }
                }
                const map = value.PricingOptions.map(function mapper(x) {
                    const data = result.body.Agents.filter(agent => agent.Id == x.Agents[0])[0];
                    const dataObj = {
                        Agents: x.Agents,
                        Price: x.Price,
                        DeeplinkUrl: x.DeeplinkUrl,
                        Name: data.Name,
                        ImageUrl: data.ImageUrl,
                        Type: data.Type
                    }
                    return dataObj
                })
                const obj = {
                    Outbound: outboundObj,
                    Inbound: inboundObj,
                    Details: map
                }
                responseArray.push(obj)
            }
        } else {
            res.status(400).send('No Data Found..')
        }
        const departurePlace = result.body.Places.filter(departure => departure.Id == result.body.Query.OriginPlace)[0];
        const arrivalPlace = result.body.Places.filter(arrival => arrival.Id == result.body.Query.DestinationPlace)[0];
        const cheapestArray = _.sortBy(responseArray, function(el) {
            return el.Details[0].Price
        })
        // const quickestArray = _.sortBy(responseArray, function(el) {
        //     return el.Outbound.DurationInMin
        // })
        // const best = responseArray.filter(bestDetails => bestDetails.Outbound.Stops.length == 0)
        // const bestArray = _.sortBy(best, function(el) {
        //     return el.Details[0].Price
        // })
        res.status(200).send({
            SessionKey: result.body.SessionKey,
            Currency: result.body.Currencies[0].Code,
            Status: result.body.Status,
            DeparturePlace: departurePlace.Name,
            ArrivalPlace: arrivalPlace.Name,
            Query: result.body.Query,
            Airlines: result.body.Carriers,
            FlightDetails: cheapestArray
        })
    } catch (error) {
        console.log(error.message)
        res.status(400).send(error.message)
    }
}

flightControllers.bookingDetails = async function (req, res) {
    try {
        const url = `http://partners.api.skyscanner.net/apiservices/pricing/v1.0/{${req.body.SessionKey}}/booking?apikey=${constant.productApiKey}`
        const result = await unirest
            .put(url)
            .headers({ 'Content-Type': 'application/x-www-form-urlencoded' })
            .send(req.body)
        const link = `${result.headers.location}?apikey=${constant.productApiKey}`
        const data = await unirest.get(link)
        if (data) res.status(200).send(data)
        else {
            let data1 = data.headers.location.split("?apikey")[0]
            const response = await unirest.get(`${data1}&apikey=${constant.productApiKey}`)
            res.status(200).send(response)
        }
    } catch (error) {
        console.log(error.message)
        res.status(400).send(error.message)
    }
}

module.exports = flightControllers;
