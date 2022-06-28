const oaInject = require('./inject.js');

const {
  Poset
} = require('./graph.js');

/* web-start */

oaInject.module('base', [])
.RegisterObject('poset', () => Poset, [], {
  related: {functions: {related: []}},
  decendants: {functions: {decendants: []}},
  ancestors: {functions: {ancestors: []}},
  addRelation: {functions: {addRelation: []}},
});

/* web-end */