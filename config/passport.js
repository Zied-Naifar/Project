const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Student = mongoose.model('student');
const Company = mongoose.model('company');
const Admin = mongoose.model('admin');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {

  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        Promise.all([Student.findById(jwt_payload.id), Company.findById(jwt_payload.id), Admin.findById(jwt_payload.id)])
          .then(([student, company, admin]) => {
            if (student) {
              return done(null, student);
            }
            if (company) {
              return done(null, company);
            }
            if (admin) {
              return done(null, admin);
            }
            return done(null, false)
          })
    })
  );
};