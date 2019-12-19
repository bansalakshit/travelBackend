const homeModel = require("./homeModel")
var unirest = require("unirest");
const constant = require('../../../config/constants')
const utility = require('../../utility/utils')
const _ = require("lodash")

exports.listOfPlaces = async function (req, res) {
    if (req.body.locale && req.body.country && req.body.currency && req.body.query) {

        const url = `http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/${req.body.country}/${req.body.currency}/${req.body.locale}/?query=${req.body.query}&apiKey=${constant.productApiKey}`;
        unirest
            .get(url)
            .then((response) => {
                res.status(200).send(response.body)
            })
            .catch(err => {
                console.log(err)
                res.status(400).send(err)
            })
    } else {
        res.status(400).send({
            err: "Enter Details"
        })
    }
}

exports.result = async function (req, res) {
    if (req.body.locale && req.body.country && req.body.currency && req.body.pickupplace &&
        req.body.dropoffplace && req.body.pickupdatetime && req.body.dropoffdatetime && req.body.driverage) {
        const url = `http://partners.api.skyscanner.net/apiservices/carhire/liveprices/v2/${req.body.country}/${req.body.currency}/${req.body.locale}/${req.body.pickupplace}/${req.body.dropoffplace}/${req.body.pickupdatetime}/${req.body.dropoffdatetime}/${req.body.driverage}?apiKey=${constant.productApiKey}&userip=${req.body.ip}`;
        unirest
            .get(url)
            .then((response) => {
                console.log("TCL: response", JSON.parse(response.body))
                const object = JSON.parse(response.body);
                if (object.cars && object.cars.length > 0) {
                    for (const key in object.cars) {
                        if (object.cars.hasOwnProperty(key)) {
                            const car = object.cars[key];
                            object.images.find(function (element) {
                                if (car.image_id === element.id) {
                                    return car.image_url = element.url;
                                }
                            });
                            object.car_classes.find(function (element) {
                                if (car.car_class_id === element.id) {
                                    return car.car_class_name = element.name;
                                }
                            });
                        }
                    }
                    res.status(200).send({
                        data: object,
                        redirecturl: response.headers.location
                    })
                } else {
                    checkFordata(res, object, response.headers.location, object.images, object.car_classes)
                }
            })
            .catch(err => {
                console.log(err)
                res.status(400).send(err)
            })
    } else {
        res.status(400).send({
            err: "Enter Details"
        })
    }
}

function checkFordata(res, object, url, images, carClass) {
    let redirectCheck = false;
    if (object.websites) {
        object.websites.map((elem) => {
            if (elem.in_progress) {
                redirectCheck = true;
            }
        });
        if (redirectCheck) {
            setTimeout(async () => {
                const fullUrl = `http://partners.api.skyscanner.net${url}`;
                unirest
                    .get(fullUrl)
                    .then((response) => {
                        const object1 = JSON.parse(response.body);
                        if (object1.cars && object1.cars.length > 0) {
                            for (const key in object1.cars) {
                                if (object1.cars.hasOwnProperty(key)) {
                                    const car = object1.cars[key];
                                    images.find(function (element) {
                                        if (car.image_id === element.id) {
                                            return car.image_url = element.url;
                                        }
                                    });
                                    carClass.find(function (element) {
                                        if (car.car_class_id === element.id) {
                                            return car.car_class_name = element.name;
                                        }
                                    });
                                }
                            }
                            res.status(200).send({
                                data: object1,
                                redirecturl: response.headers.location
                            })
                        } else {
                            checkFordata(res, object1, response.headers.location, images, carClass)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(200).send({
                            data: object,
                            redirecturl: null,
                            fetch: false
                        })
                    })
            }, 3000);
        } else {
            res.status(200).send({
                data: object,
                redirecturl: null
            })
        }
    } else {
        res.status(400).send('No data')
    }
}

exports.result2 = async function (req, res) {
    if (req.body.redirecturl) {
        const url = 'http://partners.api.skyscanner.net' + req.body.redirecturl;
        unirest
            .get(url)
            .then((response) => {
                // console.log(response)
                const object = JSON.parse(response.body);
                if (object.cars && object.cars.length > 0) {
                    res.status(200).send({
                        data: object,
                        redirecturl: response.headers.location
                    })
                } else {
                    res.status(400).send({
                        err: "No Data Found."
                    })
                }
            })
            .catch(err => {
                console.log(err)
                res.status(400).send(err)
            })

    } else {
        res.status(400).send({
            err: "Enter Details"
        })
    }
}

exports.listOfCurrency = function (req, res) {
    utility.getRedis('currencylist', async (err, data1) => {
        if (data1) {
            res.status(200).send(data1)
        } else {
            const url = `http://partners.api.skyscanner.net/apiservices/reference/v1.0/currencies?apikey=${constant.productApiKey}`;

            unirest
                .get(url)
                .then((response) => {
                    if (response.body) {
                        const sortData = _.sortBy(response.body.Currencies, function (el) {
                            return el.Code;
                        });
                        utility.addRedis('currencylist', sortData)
                        res.status(200).send(sortData)
                    } else {
                        res.status(400).send('No Data Found')
                    }
                })
                .catch(err => {
                    console.log(err)
                    res.status(400).send(err)
                })
        }
    })
}

exports.listOfCountry = function (req, res) {
    if (req.query.locale) {
        utility.getRedis('countrylist', async (err, data1) => {
            if (data1) {
                res.status(200).send(data1)
            } else {
                const url = `http://partners.api.skyscanner.net/apiservices/reference/v1.0/countries/${req.query.locale}?apiKey=${constant.productApiKey}`;
                unirest
                    .get(url)
                    .then((response) => {
                        const sortData = _.sortBy(response.body.Countries, function (el) {
                            return el.Name;
                        });
                        utility.addRedis('countrylist', sortData)
                        res.status(200).send(sortData)
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(400).send(err)
                    })
            }
        })
    } else {
        res.status(400).send({
            err: "Enter locale"
        })
    }
}

exports.listOfLocales = function (req, res) {
    utility.getRedis('localelist', async (err, data1) => {
        if (data1) {
            res.status(200).send(data1)
        } else {
            const url = `http://partners.api.skyscanner.net/apiservices/reference/v1.0/locales?apiKey=${constant.productApiKey}`;
            unirest
                .get(url)
                .then((response) => {
                    const sortData = _.sortBy(response.body.Locales, function (el) {
                        return el.Name;
                    });
                    utility.addRedis('localelist', sortData)
                    res.status(200).send(sortData)
                })
                .catch(err => {
                    console.log(err)
                    res.status(400).send(err)
                })
        }
    })
}

exports.CountryFromIp = async function (req, res) {
    if (req.body.ip) {
        const url = `http://www.geoplugin.net/json.gp?ip=${req.body.ip}`;
        unirest
            .get(url)
            .then((response) => {
                const datafromip = JSON.parse(response.body)
                const url2 = `https://iatageo.com/getCode/${datafromip.geoplugin_latitude}/${datafromip.geoplugin_longitude}`;
                unirest
                    .get(url2)
                    .then((response2) => {
                        console.log("TCL: response.body", response2.body, response.body)
                        res.status(200).send({
                            data: JSON.parse(response2.body),
                            name: datafromip.geoplugin_city,
                            curCode: datafromip.geoplugin_currencyCode,
                            cntCode: datafromip.geoplugin_countryCode
                        })
                    })
            })
            .catch(err => {
                res.status(400).send(err)
            })
    } else {
        res.status(400).send({
            err: "Enter Details"
        })
    }
}

exports.showAds = async function (req, res) {
    console.log("TCL: LocationFromIp -> req.body", req.body)
    if (req.body.data) {
        const url = 'https://travel.mediaalpha.com/ads.json';
        unirest
            .post(url)
            .header('Content-Type', 'application/json')
            .send(JSON.stringify(req.body))
            .then((response) => {
                // console.log(response)
                res.status(200).send(response.body)
            })
            .catch(err => {
                console.log(err)
                res.status(400).send(err)
            })
    } else {
        res.status(400).send({
            err: "Enter Details"
        })
    }
}