const express = require ('express');
const mongoose = require ('mongoose');

const freelancer = require ('./routes/api/freelancer');

const app = express();

//DB Config
const db = require ('./config/keys').mongoURI;

//Connect to Mongodb
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err  => console.log(err));


app.get('/', (req, res) => res.send('Hello'));

app.use('/api/freelancer', freelancer);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server is running on port ${port}`));