const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const CompanyProfileSchema = new Schema({
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    handle: {
        type: String,
        required: true,
        max: 40
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    category: {
        type: String,
        requied: true
    },
    description: {
        type: String,
        requied: true
    },
    social: {
        youtube: {
            type: String
        },
        twitter: {
            type: String
        },
        facebook: {
            type: String
        }, 
        linkedin: {
            type: String
        },
        instagram: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = CompanyProfile = mongoose.model('companyprofile', CompanyProfileSchema);