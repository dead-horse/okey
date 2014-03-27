/*!
 * okey - lib/middleware.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var path = require('path');
var debug = require('debug')('okey:middleware');
var is = require('is-type-of');
var copy = require('copy-to');

/**
 * middlewares dependence modules
 * @type {Object}
 */

exports.dependencies = {
  favicon: 'koa-favicon',
  rt: 'koa-rt',
  logger: 'koa-logger',
  compress: 'koa-compress',
  etag: 'koa-etag',
  fresh: 'koa-fresh',
  session: 'koa-sess',
  bodyParser: 'koa-bodyparser',
  csrf: 'koa-csrf',
  router: 'koa-router',
  ejs: 'koa-ejs',
  static: 'koa-static-cache',
};

/**
 * defualt use middleware names
 * @type {Array}
 */

exports.defaults = [
  'favicon',
  'rt',
  'static',
  'logger',
  'bodyParser',
  'router',
  'ejs',
  'compress',
  'etag',
  'fresh',
];

/**
 * middlewares default options
 * @type {Object}
 */

exports.options = {
  static: {
    maxAge: 365 * 24 * 60 * 60,
    gzip: true,
  },

  ejs: {
    layout: 'layout',
    viewExt: 'html'
  },

  session: {
    key: 'okey.sid'
  },
};

/**
 * load middleware into app
 * @param {String} name
 * @param {Application} app
 * @param {Object} options
 */
exports.load = function(name, app, options) {
  if (!exports.boots[name]) {
    throw new Error('can not load %s', name);
  }
  debug('load middleware %s', name);
  copy(exports.options[name] || {}).to(options);
  var mid = exports.boots[name](app, options);

  if (is.generatorFunction(mid)) {
    debug('app use middleware %s', name);
    app._use(mid);
  }
};


exports.boots = {
  /**
   * favicon middleware
   * response `/favocion.icn` 404
   */

  favicon: function () {
    return require('koa-favicon')();
  },

  /**
   * response time middleware
   * @param {Application} app
   * @param [Object] opts
   *   [Date | microtime] timer
   *   [String] headerName
   */

  rt: function (app, opts) {
    return require('koa-rt')(opts);
  },

  /**
   * dev logger middleware
   */

  logger: function (app) {
    if (app.env === 'production') {
      return null;
    }
    return require('koa-logger')();
  },

  /**
   * compress support middleware
   * @param {Application} app
   * @param {Options} opts
   *   {Number} minLength, default to 150
   */

  compress: function (app, opts) {
    return require('koa-compress')(opts);
  },

  /**
   * etag support middleware
   */

  etag: function () {
    return require('koa-etag')();
  },

  /**
   * check request fresh
   * work togather with etag
   */

  fresh: function () {
    return require('koa-fresh')();
  },

  /**
   * body parser, support `json` and `form`
   * @param {Application} app
   * @param {Object} opts
   *   {String} limit
   *   {String} jsonLimit
   */

  bodyParser: function (app, opts) {
    return require('koa-bodyparser')(opts);
  },

  /**
   * router support by koa-router
   * @param {Application} app okey / koa application instance
   */

  router: function (app) {
    return require('koa-router')(app);
  },

  /**
   * session support by koa-sess
   * @param {Application} app
   * @param {Object} opts
   */

  session: function (app, opts) {
    return require('koa-sess')(opts);
  },

  /**
   * static server support by koa-static-cache
   * @param {Application} app
   * @param {Object} opts
   */
  static: function (app, opts) {
    opts.dir = opts.dir || path.join(app.root, 'public');
    return require('koa-static-cache')(opts.dir, opts, opts.files);
  },

  /**
   * ejs render spport by koa-ejs
   * @param {Application} app
   * @param {Object} opts
   */
  ejs: function (app, opts) {
    opts.root = opts.root || path.join(app.root, 'views');
    console.log(opts);
    return require('koa-ejs')(app, opts);
  }
};
