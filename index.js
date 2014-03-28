/*!
 * okey - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var Application = require('./lib/application');
var Middleware = require('./lib/middleware');

/**
 * Expose `okey`
 */

var exports = module.exports = function () {
  return new Application(new Middleware());
};

/**
 * Expose `Application`
 */

exports.Application = Application;

/**
 * Expose `Middleware`
 */

exports.Middleware = Middleware;
