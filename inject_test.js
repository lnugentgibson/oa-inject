const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  DIValue,
  DIService,
  DIFunction,
  DIConstructor,
  DIModule
} = require('./inject.js');

describe('inject.js', function() {

describe('DIValue', function() {
  it('sets name', function() {
    var dif = new DIValue(null, 'name', 'value');
    expect(dif.name).to.equal('name');
  });
  describe('.generate', function() {
    it('works without dependencies', function() {
      var generator = sinon.spy();
      var module = {
        get: sinon.fake.returns(4)
      };
      var dif = new DIValue(module, null, 'value', generator, []);
      dif.generate();
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args.length).to.equal(0);
      expect(module.get.callCount).to.equal(0);
    });
    it('works with dependencies', function() {
      var generator = sinon.spy();
      var module = {
        get: key => {
          if(key == 'a') return 1;
          if(key == 'b') return 2;
          if(key == 'c') return 3;
        }
      };
      sinon.spy(module, 'get');
      var dif = new DIValue(module, null, 'value', generator, ['a', 'b', 'c']);
      dif.generate();
      expect(generator.calledOnce).to.be.true;
      expect(generator.withArgs(1, 2, 3).calledOnce).to.be.true;
      expect(module.get.callCount).to.equal(3);
      expect(module.get.withArgs('a').calledOnce).to.be.true;
      expect(module.get.withArgs('b').calledOnce).to.be.true;
      expect(module.get.withArgs('c').calledOnce).to.be.true;
    });
    it('only called once', function() {
      var generator = sinon.fake.returns(() => 0);
      var dif = new DIValue(null, null, 'value', generator, []);
      dif.generate();
      dif.get();
      dif.get();
      dif.get();
      expect(generator.calledOnce).to.be.true;
    });
  });
});

describe('DIFunction', function() {
  describe('.call', function() {
    it('works with no parameters and no arguments', function() {
      var ret = {v:1};
      var callback = sinon.fake.returns(ret);
      var generator = sinon.fake.returns(callback);
      var dif = new DIFunction(null, null, 'function', [], generator, []);
      expect(dif.call()).to.equal(ret);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args.length).to.equal(0);
      expect(callback.calledOnce).to.be.true;
      expect(callback.firstCall.args.length).to.equal(0);
    });
    it('works with no parameters', function() {
      var ret = {v:1};
      var callback = sinon.fake.returns(ret);
      var generator = sinon.fake.returns(callback);
      var dif = new DIFunction(null, null, 'function', [], generator, []);
      expect(dif.call(null, 1, 2, 3)).to.equal(ret);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args.length).to.equal(0);
      expect(callback.calledOnce).to.be.true;
      expect(callback.firstCall.calledWith(1, 2, 3), `callback called with ${callback.firstCall.args.join()}`).to.be.true;
    });
    it('works with no arguments', function() {
      var ret = {v:1};
      var callback = sinon.fake.returns(ret);
      var generator = sinon.fake.returns(callback);
      var module = {
        get: sinon.fake.returns(3)
      };
      var dif = new DIFunction(module, null, 'function', [{index: 0, value: 1}, {index: 2, provider: 'key'}, {index: 3, useargs: true}], generator, []);
      var cc = callback.callCount;
      var gc = module.get.callCount;
      expect(dif.call(), 'dif does not return correct value').to.equal(ret);
      expect(generator.called, 'generator not called').to.be.true;
      expect(generator.calledOnce, 'generator called more than once').to.be.true;
      expect(generator.firstCall.args.length, 'generator called with arguments').to.equal(0);
      expect(callback.called, 'callback not called').to.be.true;
      expect(callback.callCount, 'callback called more than once').to.equal(cc + 1);
      //expect(callback.calledOnce).to.be.true;
      expect(module.get.called, 'get not called').to.be.true;
      expect(module.get.callCount, 'get called more than once').to.equal(gc + 1);
      //expect(module.get.calledOnce).to.be.true;
      expect(callback.lastCall.args.length).to.equal(3);
      expect(callback.lastCall.calledWith(1, undefined, 3), `callback called with ${callback.firstCall.args.join()}`).to.be.true;
      expect(module.get.calledOnce).to.be.true;
      expect(module.get.calledWith('key')).to.be.true;
    });
    it('works', function() {
      var ret = {v:1};
      var callback = sinon.fake.returns(ret);
      var generator = sinon.fake.returns(callback);
      var module = {
        get: sinon.fake.returns(4)
      };
      var dif = new DIFunction(module, null, 'function', [{index: 0, value: 1}, {index: 1, useargs: true}, {index: 3, provider: 'key'}], generator, []);
      expect(dif.call(null, 2, 3, 5)).to.equal(ret);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args.length).to.equal(0);
      expect(callback.calledOnce).to.be.true;
      expect(callback.lastCall.args, `callback called with ${callback.firstCall.args.join()}`).to.deep.equal([1, 2, 3, 4, 5]);
      expect(module.get.calledOnce).to.be.true;
      expect(module.get.calledWith('key')).to.be.true;
    });
  });
});

describe('DIConstructor', function() {
  describe('.instantiate', function() {
    it('works with no parameters and no arguments', function() {
      var callCount = 0;
      var args = [];
      function Constructor() {
        callCount++;
        var as = [];
        for(var i = 0; i < arguments.length; i++) as.push(arguments[i]);
        args.push(as);
      }
      var generator = sinon.fake.returns(Constructor);
      var dif = new DIConstructor(null, null, 'type', [], generator, []);
      var ret = dif.instantiate();
      expect(ret).to.not.be.undefined;
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args.length).to.equal(0);
      expect(callCount).to.equal(1);
      expect(args[0].length).to.equal(0);
      expect(ret instanceof Constructor).to.be.true;
    });
    it('works with no parameters', function() {
      var callCount = 0;
      var args = [];
      function Constructor() {
        callCount++;
        var as = [];
        for(var i = 0; i < arguments.length; i++) as.push(arguments[i]);
        args.push(as);
      }
      var generator = sinon.fake.returns(Constructor);
      var dif = new DIConstructor(null, null, 'type', [], generator, []);
      var ret = dif.instantiate(1, 2, 3);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args.length).to.equal(0);
      expect(callCount).to.equal(1);
      expect(args[0]).to.deep.equal([1, 2, 3]);
      expect(ret instanceof Constructor).to.be.true;
    });
    it('works with no arguments', function() {
      var callCount = 0;
      var args = [];
      function Constructor() {
        callCount++;
        var as = [];
        for(var i = 0; i < arguments.length; i++) as.push(arguments[i]);
        args.push(as);
      }
      var generator = sinon.fake.returns(Constructor);
      var module = {
        get: sinon.fake.returns(3)
      };
      var dif = new DIConstructor(module, null, 'type', [{index: 0, value: 1}, {index: 2, provider: 'key'}, {index: 3, useargs: true}], generator, []);
      var ret = dif.instantiate();
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args.length).to.equal(0);
      expect(callCount).to.equal(1);
      expect(args[0]).to.deep.equal([1, undefined, 3]);
      expect(ret instanceof Constructor).to.be.true;
      expect(module.get.calledOnce).to.be.true;
      expect(module.get.calledWith('key')).to.be.true;
    });
    it('works', function() {
      var callCount = 0;
      var args = [];
      function Constructor() {
        callCount++;
        var as = [];
        for(var i = 0; i < arguments.length; i++) as.push(arguments[i]);
        args.push(as);
      }
      var generator = sinon.fake.returns(Constructor);
      var module = {
        get: sinon.fake.returns(4)
      };
      var dif = new DIConstructor(module, null, 'type', [{index: 0, value: 1}, {index: 1, useargs: true}, {index: 3, provider: 'key'}], generator, []);
      var ret = dif.instantiate(2, 3, 5);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args.length).to.equal(0);
      expect(callCount).to.equal(1);
      expect(args[0]).to.deep.equal([1, 2, 3, 4, 5]);
      expect(ret instanceof Constructor).to.be.true;
      expect(module.get.calledOnce).to.be.true;
      expect(module.get.calledWith('key')).to.be.true;
    });
  });
});

describe('DIModule', function() {
  describe('.RegisterValue', function() {
    it('works without dependencies', function() {
      var module = new DIModule();
      var val = {v:2};
      var generator = () => val;
      module.RegisterValue('val', generator);
      expect(module.get('val')).to.equal(val);
    });
    it('works with dependencies', function() {
      var module = new DIModule();
      module.RegisterValue('dep1', () => 1);
      module.RegisterValue('dep2', () => 2);
      module.RegisterValue('dep3', () => 3);
      var val = {v:2};
      var generator = sinon.fake.returns(val);
      module.RegisterValue('val', generator, ['dep1', 'dep2', 'dep3']);
      expect(module.get('val')).to.equal(val);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args).to.deep.equal([1,2,3]);
      //expect(generator.calledWith(1, 2, 3).calledOnce).to.be.true;
    });
    it('works with cross module dependencies', function() {
      var dmodule = new DIModule('depMod');
      dmodule.RegisterValue('dep1', () => 1);
      var module = new DIModule('mod', ['depMod']);
      module.RegisterValue('dep2', () => 2);
      module.RegisterValue('dep3', () => 3);
      var val = {v:2};
      var generator = sinon.fake.returns(val);
      module.RegisterValue('val', generator, ['dep1', 'dep2', 'dep3']);
      expect(module.get('val')).to.equal(val);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args).to.deep.equal([1,2,3]);
      //expect(generator.calledWith(1, 2, 3).calledOnce).to.be.true;
    });
  });
});

});
