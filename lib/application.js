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
var debug = require('debug')('okey:application');
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

function Application(middleware) {
  if (!(this instanceof Application)) {
    return new Application(middleware);
  }
  koa.call(this);

  this._middleware = middleware;

  // default path
  this._root = path.dirname(module.paths[0]);

  // okey use koa-router as default router
  // and the router middleware will regist after all other middlewares
  // you can disable it by set enableRouter `false`
  this.enableRouter = true;
  this.routes = [];

  // init default middlewares
  this.init();
}

/**
 * inherits from koa
 */

util.inherits(Application, koa);

/**
 * init
 * @return {[type]} [description]
 */
Application.prototype.init = function () {
  this._middlewares = [];
  this._options = {};
  var middleware = this._middleware;

  debug('init default middlewares: %j', middleware.defaults);

  middleware.defaults.forEach(function (name) {
    this._middlewares.push(name);
    this._options[name] = {};
  }.bind(this));

  var self = this;

  /**
   * define setter for every inner middlewares
   * @param {String} name
   */
  for (var key in middleware.boots) {
    (function (name) {
      self.__defineSetter__(name, function (opts) {

        if (is.undefined(this._options[name])) {
          this._middlewares.push(name);
        }
        this._options[name] = opts === true ? {} : opts;
      });
    })(key);
  }
};

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
 * get missed dependencies
 * @return {Array} middsed dependency names
 */

Application.prototype.checkDependencies = function () {
  var names = this._middleware.check(this._middlewares);

  // check koa-router
  if (this.enableRouter) {
    try {
      require.resolve('koa-router');
    } catch (err) {
      names.push('koa-router');
    }
  }

  if (names.length) {
    console.error('Some neccesory modules needed. please run: ');
    console.error('  `npm install --save %s`', names.join(' '));
    console.error('to install dependencies');
    process.exit(1);
  }
};

/**
 * boot all regist middlewares
 * boot all rotuer
 */

Application.prototype.boot = function () {
  this.checkDependencies();

  // root is important, if not set, warn user
  if (!this.setRoot) {
    console.warn('use default project root: %s', this.root);
    console.warn('you can change it by set app.root');
  }

  var self = this;
  self._middlewares.forEach(function (item) {
    is.function(item)
    ? self._use(item)
    : self._middleware.load(item, self, self._options[item]);
  });

  // boot all router
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
 * check dependencies and notice user
 */

Application.prototype.callback = function () {
  this.boot();
  return this._callback();
};

copy(proto).to(Application.prototype);
