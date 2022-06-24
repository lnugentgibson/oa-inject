const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  prefix,
  order,
  shuffle
} = require('./proxy.js');

describe('prefix', function() {
  var module, A;
  var func, ret;
  beforeEach(function() {
    module = {
      get: function(name) {
        switch(name) {
          case "a": return A;
        }
      }
    };
    ret = {};
    func = sinon.stub().returns(ret);
  });
  it('no params no args', function() {
    var b = {};
    var F = prefix(module, func, []);
    expect(F).to.equal(func);
    var R = F(b);
    expect(R).to.equal(ret);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(b)).to.be.true;
  });
  it('no params', function() {
    var F = prefix(module, func, []);
    expect(F).to.equal(func);
    var R = F();
    expect(R).to.equal(ret);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith()).to.be.true;
  });
  it('value params no args', function() {
    var B = {};
    var F = prefix(module, func, [{
      value: B
    }]);
    expect(F).to.not.equal(func);
    var R = F();
    expect(R).to.equal(ret);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(B)).to.be.true;
  });
  it('provider params no args', function() {
    var F = prefix(module, func, [{
      provider: 'a'
    }]);
    expect(F).to.not.equal(func);
    var R = F();
    expect(R).to.equal(ret);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(A)).to.be.true;
  });
  it('params and args', function() {
    var B = {};
    var c = {};
    var F = prefix(module, func, [{
      provider: 'a'
    },
    {
      value: B
    }]);
    expect(F).to.not.equal(func);
    var R = F(c);
    expect(R).to.equal(ret);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(A, B, c)).to.be.true;
  });
});