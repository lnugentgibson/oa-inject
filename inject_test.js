const {
  expect
} = require('chai');
const sinon = require('sinon');

const oaInject = require('./inject.js');

describe('oaInject', function() {
  describe('Register', function() {
    it('name contains .', function() {
      var module = oaInject.module('mod1');
      var badFn = function() { module.Register('a.b', () => {}); };
      expect(badFn).to.throw();
    });
    it('works without dependencies', function() {
      var module = oaInject.module('mod2');
      var val = {v:2};
      var generator = () => val;
      module.Register('val', generator);
      expect(module.get('val')).to.equal(val);
    });
    it('works with dependencies', function() {
      var module = oaInject.module('mod3');
      module.Register('dep1', () => 1);
      module.Register('dep2', () => 2);
      module.Register('dep3', () => 3);
      var val = {v:2};
      var generator = sinon.fake.returns(val);
      module.Register('val', generator, ['dep1', 'dep2', 'dep3']);
      expect(module.get('val')).to.equal(val);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args).to.deep.equal([1,2,3]);
      //expect(generator.calledWith(1, 2, 3).calledOnce).to.be.true;
    });
    it('works with cross module dependencies', function() {
      var dmodule = oaInject.module('depMod1');
      dmodule.Register('dep1', () => 1);
      var module = oaInject.module('mod4', ['depMod1']);
      module.Register('dep2', () => 2);
      module.Register('dep3', () => 3);
      var val = {};
      var generator = sinon.fake.returns(val);
      module.Register('val', generator, ['dep1', 'dep2', 'dep3']);
      expect(module.get('val')).to.equal(val);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args).to.deep.equal([1,2,3]);
    });
    it('works with cross module dependencies colon notation', function() {
      var dmodule = oaInject.module('depMod2');
      dmodule.Register('dep1', () => 1);
      var module = oaInject.module('mod5', ['depMod2']);
      module.Register('dep2', () => 2);
      module.Register('dep3', () => 3);
      var val = {};
      var generator = sinon.fake.returns(val);
      module.Register('val', generator, ['depMod2:dep1', 'dep2', 'dep3']);
      expect(module.get('val')).to.equal(val);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args).to.deep.equal([1,2,3]);
    });
    it('colon notation module does not depend', function() {
      var module = oaInject.module('mod6', []);
      module.Register('dep2', () => 2);
      module.Register('dep3', () => 3);
      var val = {};
      var generator = sinon.fake.returns(val);
      module.Register('val', generator, ['depMod:dep1', 'dep2', 'dep3']);
      var badFn = function() { module.get('val'); };
      expect(badFn).to.throw('does not depend');
    });
  });
  describe('RegisterField', function() {
    it('works', function() {
      var module = oaInject.module('mod7');
      var val = {v:2};
      var generator = () => val;
      module.Register('val', generator);
      module.RegisterField('v', 'val');
      expect(module.get('val.v')).to.equal(2);
    });
  });
  describe('RegisterFunction', function() {
    it('works without dependencies', function() {
      var module = oaInject.module('mod8');
      var func = () => 2;
      var generator = () => func;
      module.Register('func', generator);
      module.RegisterFunction('func', 'func', []);
      expect(module.call('func')).to.equal(2);
    });
  });
  describe('RegisterType', function() {
    it('works without dependencies', function() {
      var module = oaInject.module('mod9');
      var mock = sinon.stub();
      mock.prototype.test = sinon.stub().returns(42);
      var generator = () => mock;
      module.Register('func', generator);
      module.RegisterType('func', 'func', []);
      var inst = module.instantiate('func');
      expect(inst.test()).to.equal(42);
    });
  });
  describe('RegisterObject', function() {
    it('works without dependencies', function() {
      var mock1 = sinon.stub();
      mock1.prototype.test = sinon.stub().returns(42);
      var mock2 = sinon.stub();
      mock2.prototype.test = sinon.stub().returns(43);
      var module = oaInject.module('moda');
      var val = {
        v:2,
        f:() => 3,
        t:mock1,
        s: {
          w:4,
          g:() => 5,
          u:mock2
        }
      };
      var des = {
        v: 1,
        f: {functions:{'val.f':[]}},
        t: {types:{'val.t':[]}},
        s: {
          w:1,
          g: {functions:{'g':[]}},
          u: {types:{'u':[]}}
        }
      };
      var generator = () => val;
      module.RegisterObject('val', generator, [], des);
      var ps = [
        'val',
        'val.v',
        'val.f',
        'val.t',
        'val.s',
        'val.s.w',
        'val.s.g',
        'val.s.u',
        'val.f()',
        'val.t{}',
        'g()',
        'u{}'
      ];
      ps.sort();
      var Ps = module.getProviders();
      Ps.sort();
      expect(Ps).to.deep.equal(ps);
      expect(module.get('val')).to.equal(val);
      expect(module.get('val.v')).to.equal(2);
      expect(module.get('val.f')).to.equal(val.f);
      expect(module.call('val.f')).to.equal(3);
      expect(module.get('val.t')).to.equal(val.t);
      expect(module.instantiate('val.t').test()).to.equal(42);
      expect(module.get('val.s')).to.equal(val.s);
      expect(module.get('val.s.w')).to.equal(4);
      expect(module.get('val.s.g')).to.equal(val.s.g);
      expect(module.call('g')).to.equal(5);
      expect(module.get('val.s.u')).to.equal(val.s.u);
      expect(module.instantiate('u').test()).to.equal(43);
    });
  });
});
