const express = require ('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require ('jsonwebtoken');
const keys = require ('../../config/keys');
const passport = require ('passport');
const async = require('async');
const nodemailer = require("nodemailer");


//Load Input Validation
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

// @route   GET api/Students/login
// @desc    Login Student / Returning JWT Token
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
                errors.email = 'admin not found';
                return res.status(404).json(errors);
            }
            // Check password
            if(password === admin.password) {
                    // admin Matched

                    const payload = { id: admin.id, name: admin.name } // Create JWT Payload

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

                        })
            } else {
                errors.password = 'Password incorrect';
                return res.status(400).json(errors)
            }
        })
})

// @route   GET api/companyoffer/candidate/:id
// @desc    display candidateDetail by id 
// @access  Public
router.get('/candidate/:id',  passport.authenticate('jwt', { session: false }), (req,res) => {
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
router.post('/validation', (req, res) => {
        "use strict";

    // async..await is not allowed in global scope, must use a wrapper
    async function main(){

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
        user: "gomycode.project@gmail.com",
        pass: "0123azeRTY"
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"GoMyCode 👻" <gomycode.project@gmail.com>', // sender address
        to: "zied.naifar@gmail.co", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>" // html body
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);
})

module.exports = router;