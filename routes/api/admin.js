const express = require ('express');
const router = express.Router();
const mongoose = require('mongoose');
const gravatar = require ('gravatar');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const keys = require ('../../config/keys');
const passport = require ('passport');
const async = require('async');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gomycode.project@gmail.com',
    pass: '0123azeRTY'
  }
});

//Load Input Validation
const validateRegisterInput = require ('../../validation/studentRegister');
const validateLoginInput = require ('../../validation/login');

//Load Student Model
const Admin = require ('../../models/Admin');
const CompanyOffre = require('../../models/Offer')
const Student = mongoose.model('student')

// @route   GET api/Student/test
// @desc    Test post route
// @access  Public 
router.get('/admintest', (req, res) => 
    res.json({msg : "admin Works"})
);

// @route   GET api/admin/register
// @desc    Admin
// @access  Public 
router.post('/adminRegister', (req, res) =>{
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    Admin.findOne({email: req.body.email})
        .then((admin) => {
            if(admin) {
                errors.email = 'Email already exist';
                return res.status(400).json(errors);
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // Size
                    r: 'pg', // Rating
                    d: 'mm' //Default
                });

                const newAdmin = new Admin({
                    name: req.body.name,
                    lastname: req.body.lastname,
                    birthDate: req.body.birthDate,
                    email: req.body.email,
                    password: req.body.password,
                    avatar
                });
                console.log (newAdmin)

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newAdmin.password, salt, (err, hash) =>{
                        if (err) throw err;
                        newAdmin.password = hash;
                        newAdmin
                            .save()
                            .then(admin => res.json(admin))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
})

// @route   GET api/admin/adminlogin
// @desc    Login admin / Returning JWT Token
// @access  Public 
router.post('/adminLogin', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    Admin.findOne({email})
        .then(admin => {
            // Check for user
            if(!admin) {
                errors.email = 'Admin not found';
                return res.status(404).json(errors);
            }

            // Check password
            bcrypt.compare(password, admin.password)
                .then(isMatch => {
                    if(isMatch){
                        // admin Matched

                        const payload = { id: admin.id, name: admin.name, avatar: admin.avatar, type: admin.type } // Create JWT Payload

                        // Sign Token
                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            {expiresIn : 43200 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })

                            });
                    } else {
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors)
                    }
                })
        })
})

// @route   GET api/companyoffer/candidate/:id
// @desc    display candidateDetail by id 
// @access  Public
router.get('/candidate/:id', passport.authenticate('jwt', { session: false }), (req,res) => {
    CompanyOffre.findById(req.params.id)   
            .then(offer => {
                const list =  offer.candidate.map(id => id = id._id)
                
                var findStudent = function (id, doneCallback) {
                    Student.findById(id).then(student => {
                        return doneCallback(null, student);
                    })
                };
    
                async.map(list, findStudent, function (err, results) {
                    res.json(results);
                });
    })
})

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

// @route   POST api/companyoffer/validation
// @desc    send email to student
// @access  Public
router.post('/validation/:student_id', passport.authenticate('jwt', { session: false }), (req, res) => {
Student.findById(req.params.student_id).then(student => {
    var mailOptions = {
        from: 'gomycode.project@gmail.com',
        to: student.email,
        subject: 'Offer validation',
        text: `bonjour ${student.name}`
      };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.json({message : 'done'})
})
})

module.exports = router;