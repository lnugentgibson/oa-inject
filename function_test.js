const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  DIValue
} = require('./value.js');

const {
  DIFunction
} = require('./function.js');

describe('DIFunction', function() {
  describe('.generate', function() {
    it('no parameters', function() {
      var val;
      var func = sinon.fake.returns(val);
      var generator = sinon.fake.returns(func);
      var value = new DIValue(null, 'value', generator, []);
      var module = {
        get: sinon.fake.returns(value.get())
      };
      var F = new DIFunction(module, 'value', 'value', []);
      var f = F.get();
      expect(generator.calledOnce).to.be.true;
      expect(f).to.equal(func);
      var ctx = {}, arg = {};
      var r1 = F.call(ctx, arg);
      var r2 = F.apply(ctx, [arg]);
      expect(func.calledTwice).to.be.true;
      expect(r1).to.equal(val);
      expect(r2).to.equal(val);
      expect(func.firstCall.calledOn(ctx)).to.be.true;
      expect(func.firstCall.calledWith(arg)).to.be.true;
      expect(func.secondCall.calledOn(ctx)).to.be.true;
      expect(func.secondCall.calledWith(arg)).to.be.true;
    });
    it('prefix', function() {
      var val;
      var func = sinon.fake.returns(val);
      var generator = sinon.fake.returns(func);
      var value = new DIValue(null, 'value', generator, []);
      var module = {
        get: sinon.fake.returns(value.get())
      };
      var F = new DIFunction(module, 'value', 'value', [{value: 'A', index: 0}]);
      var f = F.get();
      expect(generator.calledOnce).to.be.true;
      expect(f).to.not.equal(func);
      var ctx = {}, arg = {};
      var r1 = F.call(ctx, arg);
      var r2 = F.apply(ctx, [arg]);
      expect(func.calledTwice).to.be.true;
      expect(r1).to.equal(val);
      expect(r2).to.equal(val);
      expect(func.firstCall.calledOn(ctx)).to.be.true;
      expect(func.firstCall.calledWith('A', arg)).to.be.true;
      expect(func.secondCall.calledOn(ctx)).to.be.true;
      expect(func.secondCall.calledWith('A', arg)).to.be.true;
    });
    it('shuffle no gaps', function() {
      var val;
      var func = sinon.fake.returns(val);
      var generator = sinon.fake.returns(func);
      var value = new DIValue(null, 'value', generator, []);
      var module = {
        get: sinon.fake.returns(value.get())
      };
      var F = new DIFunction(module, 'value', 'value', [
        {value: 'B', index: 1},
        {value: 'A', index: 0}
      ]);
      var f = F.get();
      expect(generator.calledOnce).to.be.true;
      expect(f).to.not.equal(func);
      var ctx = {}, arg = {};
      var r1 = F.call(ctx, arg);
      var r2 = F.apply(ctx, [arg]);
      expect(func.calledTwice).to.be.true;
      expect(r1).to.equal(val);
      expect(r2).to.equal(val);
      expect(func.firstCall.calledOn(ctx)).to.be.true;
      expect(func.firstCall.calledWith('A', 'B', arg)).to.be.true;
      expect(func.secondCall.calledOn(ctx)).to.be.true;
      expect(func.secondCall.calledWith('A', 'B', arg)).to.be.true;
    });
    it('shuffle gaps', function() {
      var val;
      var func = sinon.fake.returns(val);
      var generator = sinon.fake.returns(func);
      var value = new DIValue(null, 'value', generator, []);
      var module = {
        get: sinon.fake.returns(value.get())
      };
      var F = new DIFunction(module, 'value', 'value', [
        {value: 'B', index: 2},
        {value: 'A', index: 0}
      ]);
      var f = F.get();
      expect(generator.calledOnce).to.be.true;
      expect(f).to.not.equal(func);
      var ctx = {}, arg1 = {}, arg2 = {};
      var r1 = F.call(ctx, arg1, arg2);
      var r2 = F.apply(ctx, [arg1, arg2]);
      expect(func.calledTwice).to.be.true;
      expect(r1).to.equal(val);
      expect(r2).to.equal(val);
      expect(func.firstCall.calledOn(ctx)).to.be.true;
      expect(func.firstCall.calledWith('A', arg1, 'B', arg2)).to.be.true;
      expect(func.secondCall.calledOn(ctx)).to.be.true;
      expect(func.secondCall.calledWith('A', arg1, 'B', arg2)).to.be.true;
    });
  });
});
