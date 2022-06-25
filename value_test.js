const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  DIValue
} = require('./value.js');

describe('DIValue', function() {
  it('sets name', function() {
    var dif = new DIValue(null, 'name', 'value');
    expect(dif.name).to.equal('name');
    expect(dif.type).to.equal('value');
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
    it('reload', function() {
      var generator = sinon.fake.returns(() => 0);
      var dif = new DIValue(null, null, 'value', generator, []);
      dif.generate();
      dif.get();
      dif.get();
      expect(generator.calledOnce).to.be.true;
      dif.reload();
      expect(generator.callCount).to.equal(2);
    });
  });
});
