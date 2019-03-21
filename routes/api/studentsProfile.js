const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateStudentProfileInput = require('../../validation/studentProfile');

//Load Models
const StudentProfile = require('../../models/StudentProfile')
const Student = mongoose.model('student')

// router.use('*', passport.authenticate('jwt', { session: false }))

// @route   GET api/StudentProfile/test
// @desc    Test post route
// @access  Public 
router.get('/test', (req, res) => 
    res.json({msg : "studentprofile Works"})
);

// @route   GET api/StudentProfile
// @desc    get current students profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {  
    const errors = {};
    StudentProfile.findOne({ student: req.user.id })
        .then( profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this student';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => {
            res.status(404).json(err)
        })
})

// @route   POST api/StudentProfile
// @desc    Create or Edit students profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateStudentProfileInput(req.body)

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    // GEt fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.society) profileFields.society = req.body.society;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.bio) profileFields.bio = req.body.bio ;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    //Skills -Split into array
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    //Social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

    StudentProfile.findOne({ student: req.user.id }, () => {
        console.log('req.user.id=   '+ req.user.id)
        console.log('student=  '+ student)
    })
        .then(profile => {

            console.log(profile)
            if(profile) {
                // Update
                StudentProfile.findOneAndUpdate(
                    { student: req.user.id },
                    { $set: profileFields },
                    { new: true }
                )
                .then( profile => res.json(profile) );
            } else {
                // Create

                // Check if handle exists
                
                StudentProfile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile) {
                            errors.handle = 'That handle already exists';
                            return res.status(400).json(errors);
                        }
                        // Save Profile
                        new StudentProfile(profileFields).save().then(profile => res.json(profile));
                    })
            }
        })
})
        
module.exports = router;