const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const StudentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    birthDate: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    password2: {
        type: String,
    },
    avatar: {
        type: String,
    },
    date: {
        type: String,
        default: Date.now
    }
});

module.exports = student = mongoose.model('student', StudentSchema);

// let studentModel

// try {
//     studentModel = mongoose.model('student')
// } catch(err) {
//     studentModel = mongoose.model('student', StudentSchema);
// }

// module.exports = studentModel