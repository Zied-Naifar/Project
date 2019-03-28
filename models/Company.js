const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const CompanySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    password2: {
        type: String,
    },
    avatar: {
        type: String,
    },
    type: {
        type: String,
        default: 'company'
    },                                                                                                                                                                                                                     
    date: {
        type: String,
        default: Date.now
    }

});

module.exports = student = mongoose.model('company', CompanySchema);