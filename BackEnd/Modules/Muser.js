// User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  birthdate: {
    type: Date
  },
  phone: {
    type: String
  },
  requests: {
    type: Array
  },
  friends:{
    type:Array
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
 

