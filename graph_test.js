const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  Poset
} = require('./graph.js');

describe('Poset', function() {
  var poset;
  beforeEach(function() {
    poset = new Poset();
    poset.addRelation('a', 'b');
    poset.addRelation('a', 'd');
    //poset.addRelation('a', 'g');
    poset.addRelation('b', 'd');
    poset.addRelation('b', 'g');
    poset.addRelation('c', 'e');
    poset.addRelation('c', 'g');
    poset.addRelation('c', 'h');
    poset.addRelation('d', 'g');
    poset.addRelation('e', 'g');
    poset.addRelation('e', 'h');
  });
  it('direct relations', function() {
    expect(poset.related('a', 'b', true)).to.be.true;
    expect(poset.related('a', 'd', true)).to.be.true;
    expect(poset.related('b', 'd', true)).to.be.true;
    expect(poset.related('b', 'g', true)).to.be.true;
    expect(poset.related('c', 'e', true)).to.be.true;
    expect(poset.related('c', 'g', true)).to.be.true;
    expect(poset.related('c', 'h', true)).to.be.true;
    expect(poset.related('d', 'g', true)).to.be.true;
    expect(poset.related('e', 'g', true)).to.be.true;
    expect(poset.related('e', 'h', true)).to.be.true;
    expect(poset.related('a', 'a', true)).to.be.false;
    expect(poset.related('a', 'c', true)).to.be.false;
    expect(poset.related('a', 'e', true)).to.be.false;
    expect(poset.related('a', 'f', true)).to.be.false;
    expect(poset.related('a', 'g', true)).to.be.false;
    expect(poset.related('a', 'h', true)).to.be.false;
    expect(poset.related('b', 'a', true)).to.be.false;
    expect(poset.related('b', 'b', true)).to.be.false;
    expect(poset.related('b', 'c', true)).to.be.false;
    expect(poset.related('b', 'e', true)).to.be.false;
    expect(poset.related('b', 'f', true)).to.be.false;
    expect(poset.related('b', 'h', true)).to.be.false;
  });
  it('indirect relations', function() {
    expect(poset.related('a', 'b', false)).to.be.true;
    expect(poset.related('a', 'd', false)).to.be.true;
    expect(poset.related('b', 'd', false)).to.be.true;
    expect(poset.related('b', 'g', false)).to.be.true;
    expect(poset.related('c', 'e', false)).to.be.true;
    expect(poset.related('c', 'g', false)).to.be.true;
    expect(poset.related('c', 'h', false)).to.be.true;
    expect(poset.related('d', 'g', false)).to.be.true;
    expect(poset.related('e', 'g', false)).to.be.true;
    expect(poset.related('e', 'h', false)).to.be.true;
    
    expect(poset.related('a', 'g', false)).to.be.true;
    expect(poset.related('a', 'f', false)).to.be.false;
  });
  it('descendants', function () {
    var ds = poset.decendants('a');
    ds.sort();
    expect(ds).to.deep.equal(['b','d','g']);
  });
  it('ancestors', function () {
    var ds = poset.ancestors('g');
    ds.sort();
    expect(ds).to.deep.equal(['a','b','c','d','e']);
  });
  //it('nodes', function () {
  //  //expect(poset.nodes).to.deep.equal({});
  //  expect(poset.nodes['a'].out['b']).to.equal(1);
  //});
});