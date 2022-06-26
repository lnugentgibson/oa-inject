const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  DIModule
} = require('./inject.js');

describe('DIModule', function() {
  describe('Register', function() {
    it('name contains .', function() {
      var module = new DIModule();
      var badFn = function() { module.Register('a.b', () => {}); };
      expect(badFn).to.throw();
    });
    it('works without dependencies', function() {
      var module = new DIModule();
      var val = {v:2};
      var generator = () => val;
      module.Register('val', generator);
      expect(module.get('val')).to.equal(val);
    });
    it('works with dependencies', function() {
      var module = new DIModule();
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
      var dmodule = new DIModule('depMod');
      dmodule.Register('dep1', () => 1);
      var module = new DIModule('mod', ['depMod']);
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
      var dmodule = new DIModule('depMod');
      dmodule.Register('dep1', () => 1);
      var module = new DIModule('mod', ['depMod']);
      module.Register('dep2', () => 2);
      module.Register('dep3', () => 3);
      var val = {};
      var generator = sinon.fake.returns(val);
      module.Register('val', generator, ['depMod:dep1', 'dep2', 'dep3']);
      expect(module.get('val')).to.equal(val);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args).to.deep.equal([1,2,3]);
    });
    it('colon notation module does not depend', function() {
      var module = new DIModule('mod', []);
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
      var module = new DIModule();
      var val = {v:2};
      var generator = () => val;
      module.Register('val', generator);
      module.RegisterField('v', 'val');
      expect(module.get('val.v')).to.equal(2);
    });
  });
  describe('RegisterFunction', function() {
    it('works without dependencies', function() {
      var module = new DIModule();
      var func = () => 2;
      var generator = () => func;
      module.Register('func', generator);
      module.RegisterFunction('func', 'func', []);
      expect(module.call('func')).to.equal(2);
    });
  });
  describe('RegisterObject', function() {
    it('works without dependencies', function() {
      var module = new DIModule('testModule');
      var val = {
        v:2,
        f:() => 3,
        s: {
          w:4,
          g:() => 5
        }
      };
      var des = {
        v: 1,
        f: {functions:{'val.f':[]}},
        s: {
          w:1,
          g: {functions:{'val.s.g':[]}}
        }
      };
      var generator = () => val;
      module.RegisterObject('val', generator, [], des);
      var ps = [
        'val',
        'val.v',
        'val.f',
        'val.s',
        'val.s.w',
        'val.s.g',
        'val.f()',
        'val.s.g()'
      ];
      ps.sort();
      var Ps = module.getProviders();
      Ps.sort();
      expect(Ps).to.deep.equal(ps);
      expect(module.get('val')).to.equal(val);
      expect(module.get('val.v')).to.equal(2);
      expect(module.get('val.f')).to.equal(val.f);
      expect(module.call('val.f')).to.equal(3);
      expect(module.get('val.s')).to.equal(val.s);
      expect(module.get('val.s.w')).to.equal(4);
      expect(module.get('val.s.g')).to.equal(val.s.g);
      expect(module.call('val.s.g')).to.equal(5);
    });
  });
});
