const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const router = require('./src/routes');
// const compression = require('compression')

const app = express();
app.use(cors())
// app.use(compression())
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.get('/',(req,res)=>{
	res.json({
		version: '1.0.0'
	})
})
router(app)

app.listen(4000)

mongoose.connect('mongodb://localhost:27017/travel', { useNewUrlParser: true , useCreateIndex: true, useUnifiedTopology: true }, (err, db) => {
    if (err) {
        console.log('Mongodb Error');
    }
    else {
        console.log("Database created...");
    }
})

module.exports = app;
