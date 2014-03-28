/*!
 * okey - example/app.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var okey = require('..');
var routes = require('./routes');

var app = okey();

app.keys = ['okey example key'];
app.proxy = true;
app.root = __dirname;
app.env = 'production';

app.session = {};

app.use(function* setsession(next) {
  this.session.name = this.query.name || 'anonymous';
  yield* next;
});

routes(app);

if (!module.parent) {
  app.listen(7001);
  console.log('open http://localhost:7001 to visit');
}
