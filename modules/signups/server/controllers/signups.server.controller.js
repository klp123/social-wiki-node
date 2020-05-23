'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  schedule = require('node-schedule'),
  Signup = mongoose.model('Signup'),
  multer  = require('multer'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Signup
 */
exports.create = function (req, res) {
  var signup = new Signup(req.body);

  const email = req.body.email;

  Signup.find({ 'email': email }).exec(function (err, resp) {
    if (resp && resp.length > 0) {
      const message = { message: 'Email already exist' };
      res.json(message);
    } else {
      signup.save(function (err, ) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          const response = { message: 'Data inserted successfully', data: signup };
          res.json(response);
        }
      });
    }
  });
};


exports.login = function (req, res) {
  const message = { 'status': '', 'msg': '', 'data': [] };
  const toFindLogic = { 'email': req.body.email, 'password': req.body.password };
  Signup.findOne(toFindLogic).exec(function (err, resp) {
    if (err) { return err; };
    if (resp && resp.length) {
      message.status = 'sussces';
      message.msg = 'Logged in successfully';
      message.data = resp;
    } else {
      message.status = 'fail';
      message.msg = 'Logged failed';
      message.data = resp;
    }


    res.json(message);

  });

};

exports.forgotpassword = function (req, res) {
  const message = { 'status': '', 'msg': '' },
  findEmail = { 'email': req.body.email };
  Signup.find(findEmail).exec(function (err, resp) {
    if (err) { return err; };
    if (resp && resp.length) {
      message.status = 'success';
      message.msg = 'Please change password';
    }
    else {
      message.status = 'fail';
      message.msg = 'email do not exist'
    }

    res.json(message);
  });
};

exports.changePassword = function (req, res) {
  const message = { 'status': '', 'msg': '' },
  password = req.body.password;
  Signup.update(
    { 'email': req.body.email },
    { $set: { 'password': password } }
  ).exec(function (err, resp) {
    if (err) { return err; }
    else {
      message.status = 'success';
      message.msg = 'Password Changed'
    }
    res.json(message);
  });
}

exports.getList = function (req, res) {
  const message = { 'status': '', 'msg': '', 'data': [] };

  Signup.find().populate('requests_sent', 'firstName').populate('requests_recieved', 'firstName').populate('friends', 'firstName').populate('blocked_by_me.id', 'firstName').exec(function (err, resp) {
    if (err) { return err; }
    else {
      message.status = 'success';
      message.data = resp
    }
    res.json(message);
  });
}

exports.manageFriendRequests = function (req, res) {
  const body = req.body,
  message = { 'status': '', 'msg': '', 'data': [] },
  toUpdateSenderQuery = { "$addToSet": { "requests_sent": body.reciever_request_id } },
  toUpdateRecieverQuery = { "$addToSet": { "requests_recieved": body.sender_request_id } };

  Signup.update({ '_id': body.sender_request_id}, toUpdateSenderQuery).exec(function (errS, respS){
    Signup.update({ '_id': body.reciever_request_id}, toUpdateRecieverQuery).exec(function (errR, respR){
      if (errS || errR) { return errS || errR; }
      else {
        message.status = 'success';
        message.data = respR
      }
      res.json(message);
    })
  });
};

exports.acceptFriendRequests = function (req,res) {
   const message = {'status' : '', 'msg' : '', 'data' : []},
   sender_id = req.body.request_sender_id,
   acceptor_id = req.body.request_acceptor_id,
   toUpdateAcceptorQuery = { $addToSet : {"friends" : sender_id}, 
                             $pull : {"requests_recieved" : sender_id}},
   toUpdateSenderQuery = { $addToSet : {"friends" : acceptor_id}, 
                           $pull : {"requests_sent" : acceptor_id}};
   
  Signup.update({ '_id': acceptor_id }, toUpdateAcceptorQuery).exec(function (errA, respA) {
    Signup.update({ '_id': sender_id }, toUpdateSenderQuery).exec(function (errS, respS) {
      if (errA || errS) { return errA || errS; }
      else {
        message.status = 'success';
        message.data = respS;
      }
      res.json(message);
    })
  });
};

exports.deleteFriendRequests = function (req,res) {
  const message = {'status' : '', 'msg' : '', 'data' : []},
  rejector_id = req.body.request_rejector_id,
  sender_id = req.body.request_sender_id,
  toUpdateRejectorQuery = { $pull : {"requests_recieved" : sender_id}},
  toUpdateSenderQuery = { $pull : {"requests_sent" : rejector_id}};

  Signup.update({ '_id': rejector_id }, toUpdateRejectorQuery).exec(function (errR, respR) {
    Signup.update({ '_id': sender_id }, toUpdateSenderQuery).exec(function (errS, respS) {
      if (errR || errS) { return errR || errS; }
      else {
        message.status = 'success';
        message.data = respS;
      }
      res.json(message);
    })
  });
}

exports.getFriendsList = function (req,res) {
  const message = {'status' : '', 'msg' : '', 'data' : []},
  profile_id = req.body.profile_id;

  Signup.find({'_id' : profile_id},{friends : 1}).populate('friends', 'firstName').exec(function (err, resp) {
    if (err) { return err; };
    if (resp && resp[0].friends.length) {
      message.status = 'success';
      message.msg = 'Your Friends - ' + resp[0].friends.length;
      message.data = resp;
    }
    else {
      message.status = 'fail';
      message.msg = 'No Friends';
    }

    res.json(message);
  });
}

exports.searchProfile = function (req,res) {
  const message = {'status' : '', 'msg' : '', 'data' : []},
  toSearchChar = req.body.searchText,
  searchedId = req.body.id,
  searchQuery = {$and: [{$or: [{firstName: {$regex: toSearchChar,  $options: "i"}},{lastName: {$regex: toSearchChar,  $options: "i"}}]},
                       {"blocked_by_me.id" : {$ne: searchedId}}]};

  Signup.find(searchQuery).exec(function (err, resp) {
    if (err) { return err; };
    if (resp && resp.length) {
      message.status = 'success';
      message.msg = 'Search Results - ';
      message.data = resp;
    }
    else {
      message.status = 'fail';
      message.msg = 'No Friends';
    }

    res.json(message);
  });
}

exports.blockUsers = function (req,res) {
  const message = {'status' : '', 'msg' : '', 'data' : []},
  blocking_user_id = req.body.blocking_user_id,
  blocked_user_id = req.body.blocked_user_id,
  toBlockingUserQuery = {$push : {'blocked_by_me' : {id : blocked_user_id}}},
  toBlockedUserQuery = {$push : {'blocked_by_others' : blocking_user_id}};

  Signup.update({ '_id': blocking_user_id }, toBlockingUserQuery).exec(function (errR, respR) {
    Signup.update({ '_id': blocked_user_id }, toBlockedUserQuery).exec(function (errS, respS) {
      if (errR || errS) { return errR || errS; }
      else {
        message.status = 'User successfully blocked';
        message.data = respS;
      }
      res.json(message);
    })
  });
}

exports.getPeopleList = function (req,res) {
  const message = {'status' : '', 'msg' : '', 'data' : []},
  searching_person_id = req.body.searching_person_id,
  toFindLogic = {'blocked_by_me.id' : {$ne :searching_person_id}};

  Signup.find(toFindLogic).exec(function (err, resp) {
    if (err) { return err; };
    if (resp && resp.length) {
      message.status = 'success';
      message.msg = 'People';
      message.data = resp;
    }
    else {
      message.status = 'fail';
      message.msg = 'No People'
    }

    res.json(message);
  });
}

/**
 * Show the current Signup
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var signup = req.signup ? req.signup.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  signup.isCurrentUserOwner = req.user && signup.user && signup.user._id.toString() === req.user._id.toString();

  res.jsonp(signup);
};

/**
 * Update a Signup
 */
exports.update = function (req, res) {
  var signup = req.signup;

  signup = _.extend(signup, req.body);

  signup.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(signup);
    }
  });
};


/**
 * Delete an Signup
 */
exports.delete = function (req, res) {
  var signup = req.signup;

  signup.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(signup);
    }
  });
};

/**
 * List of Signups
 */
exports.list = function (req, res) {
  Signup.find().sort('-created').populate('user', 'displayName').exec(function (err, signups) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(signups);
    }
  });
};

/**
 * Signup middleware
 */
exports.signupByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Signup is invalid'
    });
  }

  Signup.findById(id).populate('user', 'displayName').exec(function (err, signup) {
    if (err) {
      return next(err);
    } else if (!signup) {
      return res.status(404).send({
        message: 'No Signup with that identifier has been found'
      });
    }
    req.signup = signup;
    next();
  });
};

// var j = schedule.scheduleJob('* * * * *', function(){
//   updateBlockedUsers();
// });

  function updateBlockedUsers() {
    const toBulkUpdateArr = [];
    Signup.find().exec(function (err, data) {
      if (err) {
        return next(err);
      } else {
        data.forEach(element => {
          let toBulkUpdateObj = {'blocked_by_me': [], '_id': element._id};
          if (element.blocked_by_me && element.blocked_by_me.length) {
            element.blocked_by_me.forEach(blockedData => {
              console.log(getDateDeference(blockedData.date)+'plplplplplplplplpl')
              if (getDateDeference(blockedData.date) < 7) {
                toBulkUpdateObj.blocked_by_me.push(blockedData);
              }
            });
          };
          toBulkUpdateArr.push(toBulkUpdateObj);
        });

        bulkUpdate(toBulkUpdateArr);

      }
    });
  }

  function bulkUpdate(toUpdateData) {
    toUpdateData.forEach(element => {
      Signup.update(
        { '_id': element._id },
        { $set: { 'blocked_by_me': element.blocked_by_me } }
      ).exec(function (err, resp) {
        if (err) { return err; }
        else {
          console.log('Updated succssfuly')
        }
      });
    });
   
  }




  function getDateDeference(date) {
    const blockedDate = date.split("T")[0];
    let currentDate = new Date();
    currentDate = currentDate.toISOString().split("T")[0];
    const diffTime = Math.abs(new Date(currentDate)- new Date(blockedDate)),
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  }
  
//   var uploadPath = '';
// var storage = multer.diskStorage({
//     destination: function (req, file, callback) {
// 		console.log(file)
//         if(file.fieldname === 'file'){
//            uploadPath = './Files/';
//         }
//         callback(null, uploadPath);
//     },
//     filename: function (req, file, callback) {
//         var ext = '';
//         var name = '';
//         if (file.originalname) {
//             var p = file.originalname.lastIndexOf(".");
//             ext = file.originalname.substring(p + 1);
//             var firstName = file.originalname.substring(0, p);
//             name = firstName + '-' + Date.now();
//             name += '.' + ext;
//         }
//         if(file.fieldname === 'file'){
//             upload_image += name;
//             upload_image += ',';
//         }
//         callback(null, name);
//     }
// });
// var upload = multer({storage: storage}).any();
// var upload_image = '';
// exports.uploadFile = function (req,res) {
// 	console.log(req);
//   upload(req, res, function (err) {
//     if (err) {
//       res.json({'err_code':1,'message':'fail'});
//         return;
//     }
//     var obj = req.body;
//     if(upload_image){

//         res.json({'err_code':0,'resultCode':'OK','resultObject':[{'lotNumber':123}]});
// 	}

//   });
// };

	

  
  //console.log('The answer to life, the universe, and everything!');
//});



/*

1) Block user

2) Search user based on block condition

3) Get users list based on block condition

4) Delete blocked users if its blocked 2 mins ago

*/