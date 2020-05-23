'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var signUpSchema = new Schema({
   firstName: {
     type: String,
     default: ''
   },
   lastName: {
    type: String,
    default: ''
   },
   email: {
    type: String,
    default: ''
   },
   phone: {
    type: String,
    default: ''
   },
   password: {
    type: String,
    default: ''
   },
   gender: {
    type: String,
    default: ''
   },
    requests_recieved: {
     type: Array
   },
   requests_sent: {
    type: Array
  },
  friends:{
    type: Array
  },
  blocked_by_others: {
    type: Array
  },
  blocked_by_me: [{id: { type: String}, date: { type: String, default: Date()}}]
});

mongoose.model('Signup', signUpSchema);
