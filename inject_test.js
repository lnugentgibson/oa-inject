const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  DIModule
} = require('./inject.js');

describe('DIModule', function() {
  describe('.Register', function() {
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
});
