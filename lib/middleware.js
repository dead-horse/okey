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
 * Expose `Middleware`
 */

module.exports = Middleware;

function Middleware() {

  /**
   * middlewares dependence modules
   * @type {Object}
   */

  this.dependencies = {
    favicon: 'koa-favicon',
    rt: 'koa-rt',
    logger: 'koa-logger',
    compress: 'koa-compress',
    etag: 'koa-etag',
    fresh: 'koa-fresh',
    session: 'koa-sess',
    bodyParser: 'koa-bodyparser',
    qs: ['koa-qs', 'qs'],
    csrf: 'koa-csrf',
    ejs: 'koa-ejs',
    static: 'koa-static-cache',
  };

  /**
   * middlewares default options
   * @type {Object}
   */

  this.defaults = [
    'favicon',
    'rt',
    'static',
    'logger',
    'bodyParser',
    'qs',
    'ejs'
  ];

  /**
   * middlewares default options
   * @type {Object}
   */

  this.options = {
    static: {
      maxAge: 0
    },

    ejs: {
      layout: 'layout',
      viewExt: 'html'
    },

    session: {
      key: 'okey.sid',
      prefix: 'okey:sess'
    },
  };

  this.boots = {
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
      if (app.env === 'production') {
        opts.buffer = opts.buffer === false ? false : true;
        opts.gzip = opts.gzip === false ? false : true;
        opts.maxAge = opts.maxAge || 365 * 24 * 60 * 60;
      }
      return require('koa-static-cache')(opts.dir, opts, opts.files);
    },

    /**
     * ejs render spport by koa-ejs
     * @param {Application} app
     * @param {Object} opts
     */
    ejs: function (app, opts) {
      opts.root = opts.root || path.join(app.root, 'views');
      return require('koa-ejs')(app, opts);
    },

    /**
     * qs support by koa-qs and qs
     */

    qs: function (app, opts) {
      return require('koa-qs')(app);
    }
  };

};

/**
 * load middleware into app
 * @param {String} name
 * @param {Application} app
 * @param {Object} options
 */

Middleware.prototype.load = function(name, app, options) {
  if (!this.boots[name]) {
    throw new Error('can not load %s', name);
  }
  debug('load middleware %s', name);
  copy(this.options[name] || {}).to(options);
  var mid = this.boots[name](app, options);

  if (is.generatorFunction(mid)) {
    debug('app use middleware %s', name);
    app._use(mid);
  }
};

Middleware.prototype.check = function (middlewares) {
  var names = [];
  var self = this;
  middlewares.forEach(function (item) {
    if (is.string(item) && self.dependencies[item]) {
      if (is.string(self.dependencies[item])) {
        return names.push(self.dependencies[item]);
      }
      names = names.concat(self.dependencies[item]);
    }
  });

  names = names.filter(function (name) {
    try {
      require.resolve(name);
      return false;
    } catch (err) {
      return true;
    }
  });
  return names;
};

/**
 * extend new middleware
 * @param {String} name
 * @param {String} dependency
 * @param {Function} boot
 * @param {Object} options
 * @return {Middleware}
 */

Middleware.prototype.extend = function (name, dependency, boot, options) {
  this.dependencies[name] = dependency;
  this.boots[name] = boot;
  this.options[name] = options || {};
  return this;
};

/**
 * remove middleware
 * @param {String} name
 * @return {Middleware}
 */

Middleware.prototype.remove = function (name) {
  delete this.dependencies[name];
  delete this.boots[name];
  delete this.options[name];
  this.defaults = this.defaults.filter(function (d) {
    return d !== name;
  });
};
