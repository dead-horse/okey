/*!
 * okey - lib/utils.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

/**
 * get the missed dependencies
 * @param {Array} names
 * @return {Array} missed dependencies names
 *
 * @api public
 */

exports.getMissedDeps = function(names) {
  return names.filter.forEach(function (name) {
    try {
      require.resolve(name);
      return false;
    } catch (err) {
      return true;
    }
  });
};
