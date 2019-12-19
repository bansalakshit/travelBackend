const hotel = require('./hotelModel')

exports.profile = async (req, res) => {
    try {
        let obj = {
            hotelName: req.body.hotelName,
            email: req.body.email,
            phoneNo: req.body.phoneNo
        }
        console.log(req.file)
        let hotelData = new hotel(obj);
        let data = await hotelData.save();
        res.status(200).send(data);


    } catch (error) {
        console.log("in catch =", error.message)
        res.status(400).send(error.message)
    }
}