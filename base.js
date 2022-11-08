const oaInject = require('./inject.js');

const {
  Poset
} = require('./graph.js');

/* web-start */

oaInject.module('base', [])
.Register('poset', () => Poset, []);

/* web-end */