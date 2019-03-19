const express = require ('express');
const router = express.Router();
const gravatar = require ('gravatar');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const keys = require ('../../config/keys');
const passport = require ('passport');

//Load Input Validation
const validateRegisterInput = require ('../../validation/studentRegister');
const validateLoginInput = require ('../../validation/login');

//Load Student Model
const Student = require ('../../models/Student');

// @route   GET api/Student/test
// @desc    Test post route
// @access  Public 
router.get('/studenttest', (req, res) => 
    res.json({msg : "Students Works"})
);

// @route   GET api/Student/register
// @desc    Register
// @access  Public 
router.post('/studentRegister', (req, res) =>{
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    Student.findOne({email: req.body.email})
        .then((student) => {
            if(student) {
                errors.email = 'Email already exist';
                return res.status(400).json(errors);
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // Size
                    r: 'pg', // Rating
                    d: 'mm' //Default
                }); 

                const newStudent = new Student({
                    name: req.body.name,
                    lastname: req.body.lastname,
                    birthDate: req.body.birthDate,
                    email: req.body.email,
                    password: req.body.password,
                    avatar
                });
                console.log (newStudent)

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newStudent.password, salt, (err, hash) =>{
                        if (err) throw err;
                        newStudent.password = hash;
                        newStudent
                            .save()
                            .then(student => res.json(student))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
})

// @route   GET api/Students/login
// @desc    Login Student / Returning JWT Token
// @access  Public 
router.post('/studentLogin', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    Student.findOne({email})
        .then(student => {
            // Check for user
            if(!student) {
                errors.email = 'Student not found';
                return res.status(404).json(errors);
            }

            // Check password
            bcrypt.compare(password, student.password)
                .then(isMatch => {
                    if(isMatch){
                        // Student Matched

                        const payload = { id: student.id, name: student.name, avatar: student.avatar } // Create JWT Payload

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

// @route   GET api/Student/current
// @desc    return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json(req.user)
});

module.exports = router;