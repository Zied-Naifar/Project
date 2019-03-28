const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const CompanyOffreSchema = new Schema({
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    handle: {
        type: String,
        required: true,
        max: 40
    },
    position: {
        type: String,
        requied: true
    },
    description: {
        type: String,
        requied: true
    },
    startDate: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    duration:{
        type: String,
        requied: true
    },
    pay: {
        type: String,
        requied: true
    },
    field: {
        type: String,
        requied: true
    },
    skills: {
        type: [String],
        required: true
    },
    candidate: [
        {
            student: {
                type: Schema.Types.ObjectId,
                ref: 'student'
            },
            candidateDate: {
                type: Date,
                default: Date.now
            },
            isAccepted: {
                type: Boolean,
                default: false
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = CompanyOffer = mongoose.model('companyoffer', CompanyOffreSchema);