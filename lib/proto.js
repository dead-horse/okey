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
var methods = require('methods');
var is = require('is-type-of');

var proto = module.exports = {

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
   * cache need etag + fresh
   */

  set cache(val) {
    val = val === true ? {} : val;
    this.conditionalGet = val;
    this.etag = val;
  },

  /**
   * set middlewares
   * @param {Object} middlewares
   */

  set: function(middlewares) {
    for (var key in middlewares) {
      this[key] = middlewares[key];
    }
  },
};

/**
 * for koa-router
 * store all regist routes
 */

['all', 'redirect', 'register', 'url', 'del']
  .concat(methods)
  .forEach(function (method) {
  proto[method] = function () {
    this.enableRouter && this.routes.push({
      method: method,
      args: arguments
    });
  };
});
