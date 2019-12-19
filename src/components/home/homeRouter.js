const express = require("express")
const router = express.Router();
const homeController = require("./homeController")

router.post("/placelist", homeController.listOfPlaces);
router.get("/currencylist", homeController.listOfCurrency);
router.get("/countrylist", homeController.listOfCountry);
router.get("/locallist", homeController.listOfLocales);
router.post("/result", homeController.result);
router.post("/result2", homeController.result2);
router.post("/country", homeController.CountryFromIp);
router.post("/showads", homeController.showAds);

module.exports = router;