const user = require('./userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    try {
        if (!req.body.name || !req.body.phoneNo || !req.body.email || !req.body.password) {
            res.status(400).send('Incomplete Details..');
        }
        else {
            let userinfo = await user.findOne({ $or: [{ email: req.body.email }, { phoneNo: req.body.phoneNo }] });
            if (userinfo) {
                res.status(400).send({ error: "User already exists" });
            }
            else {
                let obj = {
                    name: req.body.name,
                    email: req.body.email,
                    phoneNo: req.body.phoneNo
                }
                let pass = await bcrypt.hash(req.body.password, 10);
                obj.password = pass;
                let userData = new user(obj);
                let data = await userData.save();
                res.status(200).send(data);
            }
        }
    } catch (error) {
        console.log("in catch =", error.message)
        res.status(400).send(error.message)
    }
}

exports.login = (req, res) => {
    try {
        let email = req.body.email,
            password = req.body.password,
            phoneNo = req.body.phoneNo;
        let conditions = !!email ? { email: email } : { phoneNo: phoneNo };
        if(!conditions || !password) {
            console.log('Incomplete Arguements..')
            res.status(400).send('Incomplete Arguements..')
        }
        else {
            user.findOne(conditions, (err, data) => {
                if (!data) {
                    res.status(400).send('User not exist..')
                } else {
                    bcrypt.compare(req.body.password, data.password, (err, verify) => {
                        if (verify == false) {
                            res.status(400).send('Wrong Password..')
                        }
                        else {
                            const expiry = 60 * 24 * 60 * 60;
                            const token = jwt.sign({
                                _id: data._id, name: data.email
                            },
                                "qwertyui", {
                                algorithm: 'HS384',
                                expiresIn: expiry,
                                issuer: 'admin'
                            });
                            console.log(token)
                            res.status(200).send('Login Successfully..');
                        }

                    })
                }
            })
        }
    } catch (error) {
        console.log("in catch=", error.message)
        res.status(400).send(error.message)
    }
}