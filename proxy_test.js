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

describe('order', function() {
  it('no params', function() {
    let [params, unused] = order([]);
    expect(params.length).to.equal(0);
    expect(unused.length).to.equal(0);
  });
  it('no gaps', function() {
    var A = {}, B = {};
    let [params, unused] = order([
      {index: 0, value: A},
      {index: 1, value: B}
    ]);
    expect(params.length).to.equal(2);
    expect(unused.length).to.equal(0);
    expect(params[0].value).to.equal(A);
    expect(params[1].value).to.equal(B);
  });
  it('repeats', function() {
    var A = {}, B = {};
    let [params, unused] = order([
      {index: 0, value: A},
      {index: 0, value: B}
    ]);
    expect(params.length).to.equal(1);
    expect(unused.length).to.equal(0);
    expect(params[0].value).to.equal(B);
  });
  it('gaps', function() {
    var A = {}, B = {};
    let [params, unused] = order([
      {index: 0, value: A},
      {index: 2, value: B}
    ]);
    expect(params.length).to.equal(3);
    expect(unused.length).to.equal(1);
    expect(params[0].value).to.equal(A);
    expect(params[1]).to.be.undefined;
    expect(params[2].value).to.equal(B);
    expect(unused[0]).to.equal(1);
  });
  it('useargs', function() {
    var A = {}, B = {};
    let [params, unused] = order([
      {index: 0, useargs: true},
      {index: 1, value: A},
      {index: 3, value: B}
    ]);
    expect(params.length).to.equal(4);
    expect(unused.length).to.equal(2);
    expect(params[0]).to.be.undefined;
    expect(params[1].value).to.equal(A);
    expect(params[2]).to.be.undefined;
    expect(params[3].value).to.equal(B);
    expect(unused[0]).to.equal(0);
    expect(unused[1]).to.equal(2);
  });
});

describe('shuffle', function() {
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
  it('no params', function() {
    var F = shuffle(module, func, []);
    expect(F).to.equal(func);
    var R = F();
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith()).to.be.true;
    func.resetHistory();
    var c = {};
    R = F(c);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(c)).to.be.true;
  });
  it('no gaps', function() {
    var A = {}, B = {};
    var F = shuffle(module, func, [
      {index: 1, value: B},
      {index: 0, value: A}
    ]);
    expect(F).to.not.equal(func);
    var R = F();
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(A, B)).to.be.true;
    func.resetHistory();
    var c = {};
    R = F(c);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(A, B, c)).to.be.true;
  });
  it('repeats', function() {
    var A = {}, B = {};
    var F = shuffle(module, func, [
      {index: 0, value: A},
      {index: 0, value: B}
    ]);
    expect(F).to.not.equal(func);
    var R = F();
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(B)).to.be.true;
    func.resetHistory();
    var c = {};
    R = F(c);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(B, c)).to.be.true;
  });
  it('gaps', function() {
    var A = {}, B = {};
    var F = shuffle(module, func, [
      {index: 0, value: A},
      {index: 2, value: B}
    ]);
    expect(F).to.not.equal(func);
    var R = F();
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(A, undefined, B)).to.be.true;
    func.resetHistory();
    var c = {}, d = {};
    R = F(c, d);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(A, c, B, d)).to.be.true;
  });
  it('useargs', function() {
    var A = {}, B = {};
    var F = shuffle(module, func, [
      {index: 0, useargs: true},
      {index: 1, value: A},
      {index: 3, value: B}
    ]);
    expect(F).to.not.equal(func);
    var R = F();
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(undefined, A, undefined, B)).to.be.true;
    func.resetHistory();
    var c = {}, d = {}, e = {};
    R = F(c, d, e);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(c, A, d, B, e)).to.be.true;
  });
});