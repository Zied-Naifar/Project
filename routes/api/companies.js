const express = require ('express');
const router = express.Router();
const gravatar = require ('gravatar');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const keys = require ('../../config/keys');
const passport = require ('passport');

//Load Input Validation
const validateRegisterInput = require ('../../validation/companyRegister');
const validateLoginInput = require ('../../validation/login');

//Load Company Model
const Company = require ('../../models/Company');

// @route   GET api/Company/test
// @desc    Test post route
// @access  Public 
router.get('/companytest', (req, res) => 
    res.json({msg : "Company Works"})
);

// @route   GET api/Company/register
// @desc    Register
// @access  Public 
router.post('/companyRegister', (req, res) =>{
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    Company.findOne({email: req.body.email})
        .then((company) => {
            if(company) {
                errors.email = 'Email already exist';
                return res.status(400).json(errors);
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // Size
                    r: 'pg', // Rating
                    d: 'mm' //Default
                }); 

                const newCompany = new Company({
                    name: req.body.name,
                    email: req.body.email,
                    address: req.body.address,
                    phoneNumber: req.body.phoneNumber,
                    password: req.body.password,
                    avatar
                });
                console.log (newCompany)

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newCompany.password, salt, (err, hash) =>{
                        if (err) throw err;
                        newCompany.password = hash;
                        newCompany
                            .save()
                            .then(company => res.json(company))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
})

// @route   GET api/Company/login
// @desc    Login Company / Returning JWT Token
// @access  Public 
router.post('/companyLogin', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    Company.findOne({email})
        .then(company => {
            // Check for user
            if(!company) {
                errors.email = 'company not found';
                return res.status(404).json(errors);
            }

            // Check password
            bcrypt.compare(password, company.password)
                .then(isMatch => {
                    if(isMatch){
                        // Sompany Matched

                        const payload = { id: company.id, name: company.name, avatar: company.avatar, type:company.type } // Create JWT Payload

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

// @route   GET api/Company/current
// @desc    return current user
// @access  Private
// router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
//     res.json(req.user)
// });

module.exports = router;