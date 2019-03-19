const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Models
const StudentProfile = require('../../models/StudentProfile')
const Student = mongoose.model('student')

// @route   GET api/StudentProfile/test
// @desc    Test post route
// @access  Public 
router.get('/studentprofile/test', (req, res) => 
    res.json({msg : "studentprofile Works"})
);

// @route   GET api/StudentProfile/:id
// @desc    get current students profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    
}) 

module.exports = router;