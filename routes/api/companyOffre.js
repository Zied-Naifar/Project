const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateCompanyOffreInput = require('../../validation/companyOffre');

//Load Models
const CompanyOffre = require('../../models/Offer')
const Student = mongoose.model('student')

// @route   GET api/companyoffer/test
// @desc    Test post route
// @access  Public 
router.get('/test', (req, res) => 
    res.json({msg : "companyoffre Works"})
);

// @route   GET api/companyoffer/all
// @desc    Get all offre
// @access  Public
router.get('/all', (req, res) => {
    const errors = {}
    CompanyOffre.find()
        .populate('company', ['name', 'avatar'])
        .then(offers => {
            if(!offers) {
                errors.nooffer = "There are no offers";
                res.status(404).json(errors)
            }
            res.json(offers)
        })
        .catch(err => res.status(404).json({offer: 'There are no offers'}))
})

// @route   GET api/companyoffer/:handle
// @desc    Get all offer by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
    const errors = {}
    CompanyOffre.find({ handle: req.params.handle })
        .populate('company', ['name', 'avatar'])
        .then(offre => {
            if(!offre) {
                errors.nooffre = "There is no offer for this user";
                res.status(404).json(errors);
            }
            res.json(offre)
        })
        .catch(err => res.status(404).json({offre: 'There is no offer for this user'}))
})


// @route   GET api/companyoffer/:id
// @desc    Get offre by id
// @access  Public
router.get('/:id', (req, res) => {
    const errors = {}
    CompanyOffre.findOne({ _id: req.params.id })
        .populate('company', ['name', 'avatar'])
        .then(offre => {
            res.json(offre)
        })
        .catch(err => res.status(404).json(err))
})

// @route   GET api/companyoffer
// @desc    get current company offer
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {  
    const errors = {};
    CompanyOffre.findOne({ company: req.user.id })
        .populate('company', ['name', 'avatar'])
        .then( offre => {
            if(!offre) {
                errors.nooffre = 'There is no offer for this company';
                return res.status(404).json(errors);
            }
            res.json(offre);
        })
        .catch(err => {
            res.status(404).json(err)
        })
})

// @route   POST api/companyoffer
// @desc    Create new company offre
// @access  Private
router.post('/create', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateCompanyOffreInput(req.body)

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    // GEt fields
    const offerFields = {};
    offerFields.company = req.user.id;
    if(req.body.handle) offerFields.handle = req.body.handle;
    if(req.body.position) offerFields.position = req.body.position;
    if(req.body.description) offerFields.description = req.body.description;
    if(req.body.startDate) offerFields.startDate = req.body.startDate;
    if(req.body.location) offerFields.location = req.body.location;
    if(req.body.duration) offerFields.duration = req.body.duration;
    if(req.body.pay) offerFields.pay = req.body.pay;

    //Skills -Split into array
    if(typeof req.body.skills !== 'undefined') {
        offerFields.skills = req.body.skills.split(',');
    }

    new CompanyOffre(offerFields).save().then(offer => res.json(offer));
})

// @route   Put api/companyoffer
// @desc    Update company offre
// @access  Private
router.post('/update/:offer_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateCompanyOffreInput(req.body)

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    // GEt fields
    const offerFields = {};
    offerFields.company = req.user.id;
    if(req.body.handle) offerFields.handle = req.body.handle;
    if(req.body.position) offerFields.position = req.body.position;
    if(req.body.description) offerFields.description = req.body.description;
    if(req.body.startDate) offerFields.startDate = req.body.startDate;
    if(req.body.location) offerFields.location = req.body.location;
    if(req.body.duration) offerFields.duration = req.body.duration;
    if(req.body.pay) offerFields.pay = req.body.pay;

    //Skills -Split into array
    if(typeof req.body.skills !== 'undefined') {
        offerFields.skills = req.body.skills.split(',');
    }

    CompanyOffre.findOneAndUpdate(
        { _id: req.params.offer_id },
        { $set: offerFields },
        { new: true }
    )
    .populate('company', ['name', 'avatar'])
    .then(offer => res.json(offer))
    .catch(err => res.status(404).json({Update: failed}))
})

// @route   DELETE api/companyoffer
// @desc    Delete offer
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    CompanyOffre.findOneAndRemove({ _id: req.params.id })
        .then(res.json({Success: true}))
})

// @route   POST api/companyoffer/candidate/:id
// @desc    apply for an offer
// @access  Private
router.post('/candidate/:id', passport.authenticate('jwt', { session: false }), (req,res) => {
    const errors = {};
    CompanyOffre.findById(req.params.id)
        .then(offer => {
            const list = offer.candidate.map(id => id == id._id)
            console.log('list = ' + list.includes(true))
            if(list.includes(false))
            {   
                errors.condidature = 'You have already pustule on this offer';
                return res.status(404).json(errors);
            }
            else {

            const newCandidate = {
                _id: req.user.id
            }
            offer.candidate.unshift(newCandidate)

            offer.save().then(offer => res.json(offer))
            }
        })
        .catch(err => res.status(404).json({ offernotfound: 'no offer found' }))
})

// @route   DELETE api/companyoffer/candidate/:id/:candidate_id
// @desc    delete apply for an offer
// @access  Private
router.delete('/candidate/:id/:candidate_id', passport.authenticate('jwt', { session: false }), (req,res) => {
    CompanyOffre.findById(req.params.id)
        .then(offer => {
            if(offer.candidate[0].filter(candidate => candidate._id.toString() === req.params.candidate_id).length === 0) {
                return res.status(404).json({ candidate: 'candidate does not exist' })
            }
            
            // Get remove index
            const removeIndex = offer.candidate
                .map(item => item._id.toString())
                .indexOf(req.params.candidate._id)
                console.log(removeIndex)
            // Splice it out of array
            offer.candidate.splice(removeIndex, 1)

            offer.save().then(offer => res.json(offer))
        })
        .catch(err => res.json({ candidate: 'no candidate' }))
})

module.exports = router;