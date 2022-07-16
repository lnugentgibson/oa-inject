const oaInject = require('./inject.js');

const {
  Poset
} = require('./graph.js');

/* web-start */

oaInject.module('base', [])
.RegisterObject('poset', () => Poset, [], [
  {name: 'related', function: []},
  {name: 'decendants', function: []},
  {name: 'ancestors', function: []},
  {name: 'addRelation', function: []},
]);

/* web-end */