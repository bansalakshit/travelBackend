const multer = require('multer');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer")
var aws = require('aws-sdk')
var multerS3 = require('multer-s3')
// const fs = require("fs");
const path = require("path");
// const Moment = require('moment');
// const logModel = require("../components/logs/logModel")
var redis = require("redis"),
    client = redis.createClient();

let utility = {};

client.flushdb( function (err, succeeded) {
    console.log('Flushed db..'); // will be true if successfull
});

client.on("error", function (err) {
    console.log("Error " + err);
});

utility.addRedis = function (key, value) {
    const data = client.set(key, JSON.stringify(value));
    return data;
}

utility.getRedis = function (key, call) {
    client.get(key, function (err, reply) {
        // reply is null when the key is missing
        // console.log(reply, 'redis');
        call(null,JSON.parse(reply))
    });
}

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/images/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + Date.now() + path.extname(file.originalname)) //Appending .jpg
//     }
// })

// var upload = multer({                                           // upload in local storage
//     storage: storage
// });

var upload = multer({});

utility.sendEmail = async function (to, subject, contents, contentType) {

    const smtpTransport = nodemailer.createTransport({
        host: '',
        port: 587,
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: '',
            pass: ''
        }
    });
    const mailOptions = {
        to: '',
        from: to,
        subject: subject,
        text: contents
    };
    mailOptions[contentType] = contents;
    await smtpTransport.sendMail(mailOptions);
    return;
};

utility.uploadPhoto = function (req, res, next) {
    upload.single('file')(req, {}, (err) => {
        if (err) next(null)
        else {
            if (!req.file) {
                console.log("No file received");
                next(null)
            } else {
                next(null, req.file)
            }
        }
    })
}

utility.generateToken = (userObject, expiry) => {
    return token = {
        access_token: jwt.sign({
            userObject,
            exp: expiry
        }, constants.JWT_USER_SECRET),
        expires_in: expiry,
        refresh_token: jwt.sign({
            userObject,
            exp: expiry
        }, constants.refreshTokenSecret),
        scope: "read write"
    }
}

utility.verifyToken = (req, res, next) => {
    var tkn = req.headers.authorization

    if (tkn) {
        var dt1 = tkn.split('Bearer');
        var encrypt = dt1[1];
        var token = encrypt.trim();
        if (token) {
            var decoded = jwt.verify(token, constants.JWT_USER_SECRET);
            if (decoded) {
                req.user = decoded;
                return next(null, decoded);
            } else {
                return res.status(400).json({
                    "status": "Failure",
                    "message": "Invalid token"
                });
            }
        } else {
            return res.json(400, {
                "status": "Failure",
                "message": "Invalid token"
            });
        }
    } else {
        return res.status(400).json({
            "status": "Failure",
            "message": "Token not Provided"
        });
    }
}

module.exports = utility