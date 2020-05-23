'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Login = mongoose.model('Login'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  login;

/**
 * Login routes tests
 */
describe('Login CRUD tests', function () {

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

    // Save a user to the test db and create new Login
    user.save(function () {
      login = {
        name: 'Login name'
      };

      done();
    });
  });

  it('should be able to save a Login if logged in', function (done) {
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

        // Save a new Login
        agent.post('/api/logins')
          .send(login)
          .expect(200)
          .end(function (loginSaveErr, loginSaveRes) {
            // Handle Login save error
            if (loginSaveErr) {
              return done(loginSaveErr);
            }

            // Get a list of Logins
            agent.get('/api/logins')
              .end(function (loginsGetErr, loginsGetRes) {
                // Handle Logins save error
                if (loginsGetErr) {
                  return done(loginsGetErr);
                }

                // Get Logins list
                var logins = loginsGetRes.body;

                // Set assertions
                (logins[0].user._id).should.equal(userId);
                (logins[0].name).should.match('Login name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Login if not logged in', function (done) {
    agent.post('/api/logins')
      .send(login)
      .expect(403)
      .end(function (loginSaveErr, loginSaveRes) {
        // Call the assertion callback
        done(loginSaveErr);
      });
  });

  it('should not be able to save an Login if no name is provided', function (done) {
    // Invalidate name field
    login.name = '';

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

        // Save a new Login
        agent.post('/api/logins')
          .send(login)
          .expect(400)
          .end(function (loginSaveErr, loginSaveRes) {
            // Set message assertion
            (loginSaveRes.body.message).should.match('Please fill Login name');

            // Handle Login save error
            done(loginSaveErr);
          });
      });
  });

  it('should be able to update an Login if signed in', function (done) {
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

        // Save a new Login
        agent.post('/api/logins')
          .send(login)
          .expect(200)
          .end(function (loginSaveErr, loginSaveRes) {
            // Handle Login save error
            if (loginSaveErr) {
              return done(loginSaveErr);
            }

            // Update Login name
            login.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Login
            agent.put('/api/logins/' + loginSaveRes.body._id)
              .send(login)
              .expect(200)
              .end(function (loginUpdateErr, loginUpdateRes) {
                // Handle Login update error
                if (loginUpdateErr) {
                  return done(loginUpdateErr);
                }

                // Set assertions
                (loginUpdateRes.body._id).should.equal(loginSaveRes.body._id);
                (loginUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Logins if not signed in', function (done) {
    // Create new Login model instance
    var loginObj = new Login(login);

    // Save the login
    loginObj.save(function () {
      // Request Logins
      request(app).get('/api/logins')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Login if not signed in', function (done) {
    // Create new Login model instance
    var loginObj = new Login(login);

    // Save the Login
    loginObj.save(function () {
      request(app).get('/api/logins/' + loginObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', login.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Login with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/logins/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Login is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Login which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Login
    request(app).get('/api/logins/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Login with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Login if signed in', function (done) {
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

        // Save a new Login
        agent.post('/api/logins')
          .send(login)
          .expect(200)
          .end(function (loginSaveErr, loginSaveRes) {
            // Handle Login save error
            if (loginSaveErr) {
              return done(loginSaveErr);
            }

            // Delete an existing Login
            agent.delete('/api/logins/' + loginSaveRes.body._id)
              .send(login)
              .expect(200)
              .end(function (loginDeleteErr, loginDeleteRes) {
                // Handle login error error
                if (loginDeleteErr) {
                  return done(loginDeleteErr);
                }

                // Set assertions
                (loginDeleteRes.body._id).should.equal(loginSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Login if not signed in', function (done) {
    // Set Login user
    login.user = user;

    // Create new Login model instance
    var loginObj = new Login(login);

    // Save the Login
    loginObj.save(function () {
      // Try deleting Login
      request(app).delete('/api/logins/' + loginObj._id)
        .expect(403)
        .end(function (loginDeleteErr, loginDeleteRes) {
          // Set message assertion
          (loginDeleteRes.body.message).should.match('User is not authorized');

          // Handle Login error error
          done(loginDeleteErr);
        });

    });
  });

  it('should be able to get a single Login that has an orphaned user reference', function (done) {
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

          // Save a new Login
          agent.post('/api/logins')
            .send(login)
            .expect(200)
            .end(function (loginSaveErr, loginSaveRes) {
              // Handle Login save error
              if (loginSaveErr) {
                return done(loginSaveErr);
              }

              // Set assertions on new Login
              (loginSaveRes.body.name).should.equal(login.name);
              should.exist(loginSaveRes.body.user);
              should.equal(loginSaveRes.body.user._id, orphanId);

              // force the Login to have an orphaned user reference
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

                    // Get the Login
                    agent.get('/api/logins/' + loginSaveRes.body._id)
                      .expect(200)
                      .end(function (loginInfoErr, loginInfoRes) {
                        // Handle Login error
                        if (loginInfoErr) {
                          return done(loginInfoErr);
                        }

                        // Set assertions
                        (loginInfoRes.body._id).should.equal(loginSaveRes.body._id);
                        (loginInfoRes.body.name).should.equal(login.name);
                        should.equal(loginInfoRes.body.user, undefined);

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
      Login.remove().exec(done);
    });
  });
});
