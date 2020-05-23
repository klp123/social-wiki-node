'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Login Schema
 */
var LoginSchema = new Schema({
  email: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: ''
  }
});

mongoose.model('Login', LoginSchema);
//mongoose.model('Signup', signUpSchema);