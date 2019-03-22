const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateStudentProfileInput = require('../../validation/studentProfile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

//Load Models
const StudentProfile = require('../../models/StudentProfile')
const Student = mongoose.model('student')

// @route   GET api/StudentProfile/test
// @desc    Test post route
// @access  Public 
router.get('/test', (req, res) => 
    res.json({msg : "studentprofile Works"})
);

// @route   GET api/StudentProfile/all
// @desc    Get all profile
// @access  Public
router.get('/all', (req, res) => {
    const errors = {}
    StudentProfile.find()
        .populate('student', ['name', 'avatar'])
        .then(profiles => {
            if(!profiles) {
                errors.noprofile = "There are no profiles";
                res.status(404).json(errors)
            }
            res.json(profiles)
        })
        .catch(err => res.status(404).json({profile: 'There are no profiles'}))
})

// @route   GET api/StudentProfile/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
    console.log('hundle')
    const errors = {}
    StudentProfile.findOne({ handle: req.params.handle })
        .populate('student', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = "There is no profile for this user";
                res.status(404).json(errors);
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json({profile: 'There is no profile for this user'}))
})


// @route   GET api/StudentProfile/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/:user_id', (req, res) => {
    const errors = {}
    StudentProfile.findOne({ student: req.params.user_id })
        .populate('student', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = "There is no profile for this user";
                res.status(404).json(errors);
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json({profile: 'There is no profile for this user'}))
})

// @route   GET api/StudentProfile
// @desc    get current students profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {  
    const errors = {};
    StudentProfile.findOne({ student: req.user.id })
        .populate('student', ['name', 'avatar'])
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
    profileFields.student = req.user.id;
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

    StudentProfile.findOne({ student: req.user.id })
        .then(profile => {

            console.log("profile =  " + profile)
            if(profile) {
                // Update
                StudentProfile.findOneAndUpdate(
                    { student: req.user.id },
                    { $set: profileFields },
                    { new: true }
                )
                .populate('student', ['name', 'avatar'])
                .then(profile => res.json(profile));
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

// @route   POST api/StudentProfile/experience
// @desc    add experience to students profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateExperienceInput(req.body)

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    StudentProfile.findOne({ student: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description 
            }

            // Add to exp array
            profile.experience.unshift(newExp);
            profile.save().then(profile => res.json(profile));
        })
})

// @route   POST api/StudentProfile/education
// @desc    add education to students profile
// @access  Private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateEducationInput(req.body)

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    StudentProfile.findOne({ student: req.user.id })
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description 
            }

            // Add to exp array
            profile.education.unshift(newEdu);
            profile.save().then(profile => res.json(profile));
        })
})

// @route   DELETE api/StudentProfile/experience/:exp_id
// @desc    Delete experience from students profile
// @access  Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    StudentProfile.findOne({ student: req.user.id })
        .then(profile => {
            //Get remove index
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);

            // Splice out of array
            profile.experience.splice(removeIndex, 1);

            // Save
            profile.save().then(profile => res.json(profile))
        })
        .catch(err => res.status(404).json(err))
})

// @route   DELETE api/StudentProfile/education/:exp_id
// @desc    Delete education from students profile
// @access  Private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    StudentProfile.findOne({ student: req.user.id })
        .then(profile => {
            //Get remove index
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id);

            // Splice out of array
            profile.education.splice(removeIndex, 1);

            // Save
            profile.save().then(profile => res.json(profile))
        })
        .catch(err => res.status(404).json(err))
})

// @route   DELETE api/StudentProfile
// @desc    Delete student and profile
// @access  Private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    StudentProfile.findOneAndRemove({ student: req.user.id })
        .then(() => {
            Student.findOneAndRemove({ _id: req.user.id })
                .then(() => {
                    res.json({ success: true })
                })
        })
})


module.exports = router;