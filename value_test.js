const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  DIValue,
  DIField
} = require('./value.js');

describe('DIValue', function() {
  it('name contains :', function() {
    var badFn = function() { new DIValue(null, 'a:b'); };
    expect(badFn).to.throw();
  });
  //it('name contains .', function() {
  //  var badFn = function() { new DIValue(null, 'a.b'); };
  //  expect(badFn).to.throw();
  //});
  it('sets name', function() {
    var dif = new DIValue(null, 'name');
    expect(dif.name).to.equal('name');
  });
  describe('.generate', function() {
    it('works without dependencies', function() {
      var generator = sinon.spy();
      var module = {
        get: sinon.fake.returns(4)
      };
      var dif = new DIValue(module, '', generator, []);
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
      var dif = new DIValue(module, '', generator, ['a', 'b', 'c']);
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
      var dif = new DIValue(null, '', generator, []);
      dif.generate();
      dif.get();
      dif.get();
      dif.get();
      expect(generator.calledOnce).to.be.true;
    });
    it('reload', function() {
      var generator = sinon.fake.returns(() => 0);
      var dif = new DIValue(null, '', generator, []);
      dif.generate();
      dif.get();
      dif.get();
      expect(generator.calledOnce).to.be.true;
      dif.reload();
      expect(generator.callCount).to.equal(2);
    });
  });
});

describe('DIField', function() {
  it('sets name', function() {
    var dif = new DIField(null, 'field', 'parent');
    expect(dif.name).to.equal('parent.field');
  });
  describe('.generate', function() {
    it('works', function() {
      var val = {};
      var generator = sinon.fake.returns({child: val});
      var parent = new DIValue(null, 'parent', generator, []);
      var module = {
        get: sinon.fake.returns(parent.get())
      };
      var child = new DIField(module, 'child', 'parent');
      var c = child.get();
      expect(generator.calledOnce).to.be.true;
      expect(c).to.equal(val);
    });
  });
});
