/*!
 * okey - example/routes.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

var home = require('./controllers/home');

module.exports = function (app) {
  app.get('/', home);
};
