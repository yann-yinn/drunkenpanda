'use strict';

var _ = require('lodash');
var async = require('async');
var model = require('seraph-model');
var db = require('../services/database').db;
var Instrument = require('./instrument');
var bcrypt = require('bcrypt');
var error = require('../services/error');
var search = require('../services/search');

/**
 * Expose model.
 */

var User = module.exports = model(db, 'User');

/**
 * Schema.
 */

User.schema = {
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String }
};

User.setUniqueKey('email');

User.compose(Instrument, 'played_instruments', 'plays', { many: true });

/**
 * Hash password.
 */

User.on('prepare', function (user, callback) {
  if (!user.id && !user.password) return callback(error('user:invalidPassword'));
  if (!user.password) return callback(null, user);

  // Hash the provided password
  async.waterfall([
    bcrypt.genSalt,
    _.partial(bcrypt.hash, user.password)
  ], function (err, passwordHash) {
    if (err) return callback(err);
    user.passwordHash = passwordHash;
    callback(null, _.omit(user, 'password'));
  });
});

/**
 * Ensure we always have an hashed password.
 */

User.on('validate', function (user, callback) {
  if (!user.passwordHash) return callback(error('user:missingPasswordHash'));
  callback();
});

/**
 * Index user for search
 */

User.on('afterSave', _.partial(search.indexModel, User));
