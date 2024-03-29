'use strict';

var _ = require('lodash');
var express = require('express');
var error = require('../../../../services/error');

/**
 * Expose module.
 */

module.exports = function (opts) {
  _.defaults(opts, {
    app: new express.Router()
  })
  .app.get('/:id', function (req, res, next) {
    opts.model.read(req.params.id, function (err, result) {
      if (err) return next(err);
      if (!result) return next(error('api:notFound'));

      res.send(result);
    });
  });

  return opts.app;
};
