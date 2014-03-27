/*!
 * okey - proto.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var path = require('path');
var middleware = require('./middleware');
var methods = require('methods');
var is = require('is-type-of');

var proto = module.exports = {

  /**
   * enable or disable and set options for default middlewares
   * @param {Boolean} enable
   */

  /**
   * cache need etag + fresh
   */

  set cache(opts) {
    this.getMiddleware('etag') = opts;
    this.getMiddleware('fresh') = opts;
  },

  /**
   * set app root dir
   * important for default render and static file server
   */

  set root(dir) {
    this._root = dir;
    this.setRoot = true;
  },

  /**
   * get app root dir
   */

  get root() {
    return this._root;
  },

  /**
   * set koa-ejs locals
   */

  set locals(val) {
    this.getOptions('ejs').locals = val;
  },

  /**
   * get middleware by name
   * @param {String} name
   * @return {Object}
   */

  getMiddleware: function (name) {
    for (var i = 0; i !== this._middlewares.length; i++) {
      if (this._middlewares[i].name === name) {
        return this._middlewares[i];
      }
    }
  },

  /**
   * get default middleware options by name
   * @param {String} name
   * @return {Object}
   */

  getOptions: function (name) {
    return this._options[name];
  },

  /**
   * get missed dependencies
   * @return {Array} middsed dependency names
   */

  checkDependencies: function () {
    var names = [];
    this._middlewares.forEach(function (item) {
      if (is.string(item) && middleware.dependencies[item]) {
        names.push(middleware.dependencies[item]);
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

    if (names.length) {
      console.error('Some neccesory modules needed. please run: ');
      console.error('  `npm install --save %s`', names.join(' '));
      console.error('to install dependencies');
      process.exit(1);
    }
  }
};


/**
 * define setter for every inner middlewares
 * @param {String} name
 */

for (var name in middleware.boots) {
  proto.__defineSetter__(name, function (opts) {
    if (this._options[name] === undefined) {
      this._middlewares.push(name);
    }

    this._options[name] = opts;
  });
}

/**
 * hack for koa-router
 */

['all', 'redirect', 'register', 'url', 'del']
  .concat(methods)
  .forEach(function (method) {
  proto[method] = function () {
    if (middleware.dependencies.router === 'koa-router'
      && this._options.router) {
      this.checkDependencies();
      middleware.load('router', this, this._options.router);
      this._options.router = false;
    }
    this[method].apply(this, arguments);
  };
});
