const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Student = mongoose.model('student');
const Company = mongoose.model('company');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {

  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        Student.findById(jwt_payload.id)
        .then(student => {
          if (student) {
            return done(null, student);
          }
          
        })
        Company.findById(jwt_payload.id)
        .then(company => {
          if (student) {
             return done(null, company);
         }
        })
    })
  );
};