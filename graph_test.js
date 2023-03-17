const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  Poset
} = require('./graph.js');

describe('Poset', function() {
  let poset;
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
  it('direct descendants', function () {
    expect(poset.descendants('a', true)).to.deep.equal(['b', 'd']);
    expect(poset.descendants('b', true)).to.deep.equal(['d', 'g']);
    expect(poset.descendants('c', true)).to.deep.equal(['e', 'g', 'h']);
    expect(poset.descendants('d', true)).to.deep.equal(['g']);
    expect(poset.descendants('e', true)).to.deep.equal(['g', 'h']);
    expect(poset.descendants('f', true)).to.deep.equal([]);
    expect(poset.descendants('g', true)).to.deep.equal([]);
    expect(poset.descendants('h', true)).to.deep.equal([]);
  });
  it('indirect descendants', function () {
    let ds = poset.descendants('a');
    ds.sort();
    expect(ds).to.deep.equal(['b','d','g']);
  });
  it('array single descendants', function () {
    let ds = poset.descendants(['a']);
    ds.sort();
    expect(ds).to.deep.equal(['b','d','g']);
  });
  it('array descendants', function () {
    let ds = poset.descendants(['b', 'd']);
    ds.sort();
    expect(ds).to.deep.equal(['g']);
    
    ds = poset.descendants(['c', 'e']);
    ds.sort();
    expect(ds).to.deep.equal(['g', 'h']);
  });
  it('direct ancestors', function () {
    expect(poset.ancestors('a', true)).to.deep.equal([]);
    expect(poset.ancestors('b', true)).to.deep.equal(['a']);
    expect(poset.ancestors('c', true)).to.deep.equal([]);
    expect(poset.ancestors('d', true)).to.deep.equal(['a', 'b']);
    expect(poset.ancestors('e', true)).to.deep.equal(['c']);
    expect(poset.ancestors('f', true)).to.deep.equal([]);
    expect(poset.ancestors('g', true)).to.deep.equal(['b', 'c', 'd', 'e']);
    expect(poset.ancestors('h', true)).to.deep.equal(['c', 'e']);
  });
  it('indirect ancestors', function () {
    let ds = poset.ancestors('g');
    ds.sort();
    expect(ds).to.deep.equal(['a','b','c','d','e']);
  });
  it('array single ancestors', function () {
    let ds = poset.ancestors(['g']);
    ds.sort();
    expect(ds).to.deep.equal(['a','b','c','d','e']);
  });
  it('array ancestors', function () {
    let ds = poset.ancestors(['b', 'd']);
    ds.sort();
    expect(ds).to.deep.equal(['a']);
    
    ds = poset.ancestors(['g', 'd']);
    ds.sort();
    expect(ds).to.deep.equal(['a', 'b', 'c', 'e']);
  });
  it('roots', function() {
    expect(poset.roots()).to.deep.equal(['a', 'c']);
  });
  it('leaves', function() {
    expect(poset.leaves()).to.deep.equal(['g', 'h']);
  });
  it('interior', function() {
    expect(poset.interior('a', 'g')).to.deep.equal(['a', 'b', 'd', 'g']);
  });
  it('exterior', function() {
    expect(poset.exterior(['a', 'g'])).to.deep.equal(['h']);
    expect(poset.exterior(['a'])).to.deep.equal(['c', 'e', 'h']);
    expect(poset.exterior(['e', 'g'])).to.deep.equal([]);
  });
  it('xdescendants', function() {
    expect(poset.xdescendants(['a', 'b'])).to.deep.equal(['d']);
    expect(poset.xdescendants(['c'])).to.deep.equal(['e', 'h']);
    expect(poset.xdescendants(['b', 'd'])).to.deep.equal([]);
  });
  it('xancestors', function() {
    expect(poset.xancestors(['g', 'd'])).to.deep.equal(['a', 'b']);
    expect(poset.xancestors(['g'])).to.deep.equal(['a', 'b', 'd']);
    expect(poset.xancestors(['b', 'd'])).to.deep.equal(['a']);
    expect(poset.xancestors(['e'])).to.deep.equal([]);
  });
  //it('nodes', function () {
  //  //expect(poset.nodes).to.deep.equal({});
  //  expect(poset.nodes['a'].out['b']).to.equal(1);
  //});
});