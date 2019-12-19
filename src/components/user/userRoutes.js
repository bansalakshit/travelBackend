const express = require('express')
const router = express.Router()
const userController = require('./userController');
const uploads = require('../../utility/utils')

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/upload', uploads.uploadPhoto);

module.exports = router;