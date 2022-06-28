const {
  expect
} = require('chai');

const {
  Poset
} = require('./graph.js');

const oaInject = require('./inject.js');
require('./base.js');
const base = oaInject.getModule('base');

describe('Math', function() {
  it('works', function() {
    expect(base.get('poset')).to.equal(Poset);
  });
});
