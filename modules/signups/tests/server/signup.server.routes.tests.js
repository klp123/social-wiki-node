'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Signup = mongoose.model('Signup'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  signup;

/**
 * Signup routes tests
 */
describe('Signup CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Signup
    user.save(function () {
      signup = {
        name: 'Signup name'
      };

      done();
    });
  });

  it('should be able to save a Signup if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Signup
        agent.post('/api/signups')
          .send(signup)
          .expect(200)
          .end(function (signupSaveErr, signupSaveRes) {
            // Handle Signup save error
            if (signupSaveErr) {
              return done(signupSaveErr);
            }

            // Get a list of Signups
            agent.get('/api/signups')
              .end(function (signupsGetErr, signupsGetRes) {
                // Handle Signups save error
                if (signupsGetErr) {
                  return done(signupsGetErr);
                }

                // Get Signups list
                var signups = signupsGetRes.body;

                // Set assertions
                (signups[0].user._id).should.equal(userId);
                (signups[0].name).should.match('Signup name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Signup if not logged in', function (done) {
    agent.post('/api/signups')
      .send(signup)
      .expect(403)
      .end(function (signupSaveErr, signupSaveRes) {
        // Call the assertion callback
        done(signupSaveErr);
      });
  });

  it('should not be able to save an Signup if no name is provided', function (done) {
    // Invalidate name field
    signup.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Signup
        agent.post('/api/signups')
          .send(signup)
          .expect(400)
          .end(function (signupSaveErr, signupSaveRes) {
            // Set message assertion
            (signupSaveRes.body.message).should.match('Please fill Signup name');

            // Handle Signup save error
            done(signupSaveErr);
          });
      });
  });

  it('should be able to update an Signup if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Signup
        agent.post('/api/signups')
          .send(signup)
          .expect(200)
          .end(function (signupSaveErr, signupSaveRes) {
            // Handle Signup save error
            if (signupSaveErr) {
              return done(signupSaveErr);
            }

            // Update Signup name
            signup.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Signup
            agent.put('/api/signups/' + signupSaveRes.body._id)
              .send(signup)
              .expect(200)
              .end(function (signupUpdateErr, signupUpdateRes) {
                // Handle Signup update error
                if (signupUpdateErr) {
                  return done(signupUpdateErr);
                }

                // Set assertions
                (signupUpdateRes.body._id).should.equal(signupSaveRes.body._id);
                (signupUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Signups if not signed in', function (done) {
    // Create new Signup model instance
    var signupObj = new Signup(signup);

    // Save the signup
    signupObj.save(function () {
      // Request Signups
      request(app).get('/api/signups')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Signup if not signed in', function (done) {
    // Create new Signup model instance
    var signupObj = new Signup(signup);

    // Save the Signup
    signupObj.save(function () {
      request(app).get('/api/signups/' + signupObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', signup.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Signup with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/signups/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Signup is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Signup which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Signup
    request(app).get('/api/signups/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Signup with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Signup if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Signup
        agent.post('/api/signups')
          .send(signup)
          .expect(200)
          .end(function (signupSaveErr, signupSaveRes) {
            // Handle Signup save error
            if (signupSaveErr) {
              return done(signupSaveErr);
            }

            // Delete an existing Signup
            agent.delete('/api/signups/' + signupSaveRes.body._id)
              .send(signup)
              .expect(200)
              .end(function (signupDeleteErr, signupDeleteRes) {
                // Handle signup error error
                if (signupDeleteErr) {
                  return done(signupDeleteErr);
                }

                // Set assertions
                (signupDeleteRes.body._id).should.equal(signupSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Signup if not signed in', function (done) {
    // Set Signup user
    signup.user = user;

    // Create new Signup model instance
    var signupObj = new Signup(signup);

    // Save the Signup
    signupObj.save(function () {
      // Try deleting Signup
      request(app).delete('/api/signups/' + signupObj._id)
        .expect(403)
        .end(function (signupDeleteErr, signupDeleteRes) {
          // Set message assertion
          (signupDeleteRes.body.message).should.match('User is not authorized');

          // Handle Signup error error
          done(signupDeleteErr);
        });

    });
  });

  it('should be able to get a single Signup that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Signup
          agent.post('/api/signups')
            .send(signup)
            .expect(200)
            .end(function (signupSaveErr, signupSaveRes) {
              // Handle Signup save error
              if (signupSaveErr) {
                return done(signupSaveErr);
              }

              // Set assertions on new Signup
              (signupSaveRes.body.name).should.equal(signup.name);
              should.exist(signupSaveRes.body.user);
              should.equal(signupSaveRes.body.user._id, orphanId);

              // force the Signup to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Signup
                    agent.get('/api/signups/' + signupSaveRes.body._id)
                      .expect(200)
                      .end(function (signupInfoErr, signupInfoRes) {
                        // Handle Signup error
                        if (signupInfoErr) {
                          return done(signupInfoErr);
                        }

                        // Set assertions
                        (signupInfoRes.body._id).should.equal(signupSaveRes.body._id);
                        (signupInfoRes.body.name).should.equal(signup.name);
                        should.equal(signupInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Signup.remove().exec(done);
    });
  });
});
