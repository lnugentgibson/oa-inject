const oaInject = require('./inject.js');

const {
  Poset
} = require('./graph.js');

/* web-start */

const base = oaInject.module('base', []);
base.Register('poset', () => Poset, []);

/* web-end */

module.exports = base;