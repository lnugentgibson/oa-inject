const {
  expect
} = require('chai');

let {
  E,
  LN2,
  LN10,
  LOG2E,
  LOG10E,
  PI,
  SQRT1_2,
  SQRT2,
  abs,
  random
} = Math;

const oaInject = require('./inject.js');
require('./js.js');
const builtin = oaInject.getModule('builtin');

describe('Math', function() {
  it('E', function() {
    expect(abs(builtin.get('Math.E') - E) < .000001).to.be.true;
  });
  it('LN2', function() {
    expect(abs(builtin.get('Math.LN2') - LN2) < .000001).to.be.true;
  });
  it('LN10', function() {
    expect(abs(builtin.get('Math.LN10') - LN10) < .000001).to.be.true;
  });
  it('LOG2E', function() {
    expect(abs(builtin.get('Math.LOG2E') - LOG2E) < .000001).to.be.true;
  });
  it('LOG10E', function() {
    expect(abs(builtin.get('Math.LOG10E') - LOG10E) < .000001).to.be.true;
  });
  it('PI', function() {
    expect(abs(builtin.get('Math.PI') - PI) < .000001).to.be.true;
  });
  it('SQRT1_2', function() {
    expect(abs(builtin.get('Math.SQRT1_2') - SQRT1_2) < .000001).to.be.true;
  });
  it('SQRT2', function() {
    expect(abs(builtin.get('Math.SQRT2') - SQRT2) < .000001).to.be.true;
  });
  it('abs', function() {
    for(var i = 0; i < 20; i++) {
      var x = random() * 1000 - 500;
      var e = abs(x);
      var a = builtin.call('abs', x);
      expect(abs(a - e) < .000001, `abs failed for ${x}. Expected ${e} to equal ${a}`).to.be.true;
    }
  });
});

describe('Promise', function() {
  it('constructor', function() {
    let p = builtin.instantiate('Promise', (resolve, reject) => resolve);
    expect(p instanceof Promise).to.be.true;
  });
  it('resolve', function() {
    let p = builtin.call('resolve', 5);
    expect(p instanceof Promise).to.be.true;
  });
});