const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateCompanyProfileInput = require('../../validation/companyProfile');

//Load Models
const CompanyProfile = require('../../models/CompanyProfile')
const Company = mongoose.model('company')

// @route   GET api/CompanyProfile/test
// @desc    Test post route
// @access  Public 
router.get('/test', (req, res) => 
    res.json({msg : "companyprofile Works"})
);

// @route   GET api/CompanyProfile/all
// @desc    Get all profile
// @access  Public
router.get('/all', (req, res) => {
    const errors = {}
    CompanyProfile.find()
        .populate('company', ['name', 'avatar'])
        .then(profiles => {
            if(!profiles) {
                errors.noprofile = "There are no profiles";
                res.status(404).json(errors)
            }
            res.json(profiles)
        })
        .catch(err => res.status(404).json({profile: 'There are no profiles'}))
})

// @route   GET api/CompanyProfile/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/:user_id', (req, res) => {
    const errors = {}
    CompanyProfile.findOne({ company: req.params.user_id })
        .populate('company', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = "There is no profile for this user";
                res.status(404).json(errors);
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json(err))
})


// @route   GET api/CompanyProfile
// @desc    get current company profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {  
    const errors = {};
    CompanyProfile.findOne({ company: req.user.id })
        .populate('company', ['name', 'email', 'address', 'phoneNumber', 'avatar', 'date'])
        .then( profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this company';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => {
            res.status(404).json(err)
        })
})

// @route   POST api/CompanyProfile
// @desc    Create or Edit company profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateCompanyProfileInput(req.body)

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    // GEt fields
    const profileFields = {};
    profileFields.company = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.category) profileFields.category = req.body.category;
    if(req.body.description) profileFields.description = req.body.description;
    

    //Social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

    CompanyProfile.findOne({ company: req.user.id })
        .then(profile => {

            console.log("profile =  " + profile)
            if(profile) {
                // Update
                CompanyProfile.findOneAndUpdate(
                    { company: req.user.id },
                    { $set: profileFields },
                    { new: true }
                )
                .populate('company', ['name', 'avatar'])
                .then(profile => res.json(profile));
            } else {
                // Create

                // Check if handle exists
                
                CompanyProfile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile) {
                            errors.handle = 'That handle already exists';
                            return res.status(400).json(errors);
                        }
                        // Save Profile
                        new CompanyProfile(profileFields).save().then(profile => res.json(profile));
                    })
            }
        })
})

// @route   DELETE api/CompanyProfile
// @desc    Delete company and profile
// @access  Private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    CompanyProfile.findOneAndRemove({ company: req.user.id })
        .then(() => {
            Company.findOneAndRemove({ _id: req.user.id })
                .then(() => {
                    res.json({ success: true })
                })
        })
})

// @route   GET api/companyProfile/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
    console.log('hundle')
    const errors = {}
    CompanyProfile.findOne({ handle: req.params.handle })
        .populate('company', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = "There is no profile for this user";
                res.status(404).json(errors);
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json({profile: 'There is no profile for this user'}))
})

module.exports = router;