const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateCompanyProfileInput(data) {
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.position = !isEmpty(data.position) ? data.position : '';
    data.description = !isEmpty(data.description) ? data.description : '';
    data.startDate = !isEmpty(data.startDate) ? data.startDate : '';
    data.location = !isEmpty(data.location) ? data.location : '';
    data.duration = !isEmpty(data.duration) ? data.duration : '';
    data.pay = !isEmpty(data.pay) ? data.pay : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';

    if (!Validator.isLength(data.handle, { min: 2, max: 40 })) {
        errors.handle = 'Handle needs to be between 2 and 40 characters'
    }

    if (Validator.isEmpty(data.handle)) {
        errors.handle = 'Profile handle is required'
    }

    if (Validator.isEmpty(data.position)) {
        errors.position = 'Position field is required'
    }

    if (Validator.isEmpty(data.description)) {
        errors.description = 'Description field is description'
    }

    if (Validator.isEmpty(data.startDate)) {
        errors.startDate = 'StartDate field is required'
    }

    if (Validator.isEmpty(data.location)) {
        errors.location = 'Location field is required'
    }

    if (Validator.isEmpty(data.duration)) {
        errors.duration = 'Duration field is required'
    }

    if (Validator.isEmpty(data.pay)) {
        errors.pay = 'Pay field is required'
    }

    if (Validator.isEmpty(data.skills)) {
        errors.skills = 'Skills field is required'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};