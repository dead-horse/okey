/*!
 * okey - lib/okey.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var assert = require('assert');
var path = require('path');
var util = require('util');
var http = require('http');
var koa = require('koa');
var copy = require('copy-to');
var debug = require('debug')('okey');
var middleware = require('./middleware');
var proto = require('./proto');
var is = require('is-type-of');

/**
 * Expose `Application`
 */

module.exports = Application;

/**
 * Initialize a new application
 * @param {Object} mids
 *   {
 *     favicon: false,
 *     bodyParser: true
 *   }
 *
 * @api public
 */

function Application() {
  if (!(this instanceof Application)) {
    return new Application();
  }
  koa.call(this);
  this._middlewares = [];
  this._options = {};

  // init default middlwares
  middleware.defaults.forEach (function (name) {
    this._middlewares.push(name);
    this._options[name] = {};
  }.bind(this));

  // default path
  this._root = path.dirname(module.paths[0]);

  this.enableRouter = true;
  this.routes = [];
}

/**
 * inherits from koa
 */

util.inherits(Application, koa);

/**
 * save koa.use as Application._use
 */

Application.prototype._use = Application.prototype.use;

/**
 * extend koa.use
 * @param {GeneratorFunction} mid
 */

Application.prototype.use = function(fn) {
  assert(is.generatorFunction(fn), 'app.use() requires a generator function');
  debug('use %s', fn._name || fn.name || '-');
  this._middlewares.push(fn);
};

/**
 * save koa.callback as Application._callback
 */

Application.prototype._callback = Application.prototype.callback;

/**
 * boot all regist middlewares
 */

Application.prototype.boot = function () {
  var self = this;
  self._middlewares.forEach(function (item) {
    is.function(item)
    ? self._use(item)
    : middleware.load(item, self, self._options[item]);
  });
  self._middlewares = [];

  // load router
  if (!self.enableRouter) {
    return;
  }
  self._use(require('koa-router')(self));
  self.routes.forEach(function (item) {
    self[item.method].apply(self, item.args);
  });
};


/**
 * extend Application.callback
 * check dependencies
 */

Application.prototype.callback = function () {
  this.checkDependencies();

  if (!this.setRoot) {
    console.warn('use default project root: %s', this.root);
    console.warn('you can change it by set app.root');
  }

  this.boot();

  return this._callback();
};

copy(proto).to(Application.prototype);
