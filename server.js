const express = require ('express');
const mongoose = require ('mongoose');
const bodyParser = require ('body-parser');
const passport = require ('passport');

const students = require ('./routes/api/students');
const companies = require ('./routes/api/companies');
const studentsProfile = require ('./routes/api/studentsProfile');


const app = express();

//Body parser middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(require('morgan')('dev'))

//DB Config
// const db = require ('./config/keys').mongoURI;
var mongoDB = 'mongodb://127.0.0.1/my_database';

//Connect to Mongodb
mongoose
    .connect(mongoDB, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err  => console.log(err));


// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

app.use('/api', students);
app.use('/api', companies);
app.use('/api/studentprofile', studentsProfile);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server is running on port ${port}`));