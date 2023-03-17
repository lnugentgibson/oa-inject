const {
  expect
} = require('chai');
const sinon = require('sinon');

const oaInject = require('./inject.js');
const base = oaInject.getModule('base');

const {
  Poset
} = require('./graph.js');

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
    it('cyclic dependencies', function() {
      var module = oaInject.module('mod2b');
      expect(() => {
        module.Register('B', () => 1, ['A']);
        module.Register('A', () => 2, ['B']);
        module.get('A');
      }).to.throw('cyclic');
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
    it('generate works with dependencies', function() {
      var module = oaInject.module('mod3c');
      module.Register('dep1', () => 1);
      module.Register('dep2', () => 2);
      module.Register('dep2b', () => -2);
      module.Register('dep3', () => 3);
      var generator = sinon.stub().callsFake((a,b,c) => ({v:a+b+c}));
      module.Register('val', generator, ['dep1', 'dep2', 'dep3']);
      
      let val = module.get('val');
      expect(val).to.deep.equal({v:6});
      expect(generator.calledOnce).to.be.true;
      //expect(generator.firstCall.args).to.deep.equal([1,2,3]);
      expect(generator.calledWith(1, 2, 3), generator.firstCall.args.join()).to.be.true;
      
      val = module.gen('val', {dep2: 'dep2b'});
      expect(val).to.deep.equal({v:2});
      expect(generator.callCount).to.equal(2);
      //expect(generator.firstCall.args).to.deep.equal([1,2,3]);
      expect(generator.calledWith(1, -2, 3), generator.secondCall.args.join()).to.be.true;
      
      val = module.gen('val', null, {dep2: 4});
      expect(val).to.deep.equal({v:8});
      expect(generator.callCount).to.equal(3);
      //expect(generator.firstCall.args).to.deep.equal([1,2,3]);
      expect(generator.calledWith(1, 4, 3), generator.thirdCall.args.join()).to.be.true;
      
      val = module.get('val');
      expect(val).to.deep.equal({v:6});
      expect(generator.callCount).to.equal(3);
      //expect(generator.firstCall.args).to.deep.equal([1,2,3]);
      expect(generator.calledWith(1, 2, 3), generator.firstCall.args.join()).to.be.true;
    });
    it('works with overridden dependencies', function() {
      var module = oaInject.module('mod3b');
      module.Register('dep1', () => 1);
      module.Register('dep2', () => 2);
      module.Register('dep3', () => 3);
      module.Register('dep2alt', () => 2.5);
      var val = {v:2};
      var generator = sinon.fake.returns(val);
      module.Register('val', generator, ['dep1', 'dep2', 'dep3']);
      expect(module.get('val', {dep2: 'dep2alt'})).to.equal(val);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args).to.deep.equal([1,2.5,3]);
      //expect(generator.calledWith(1, 2, 3).calledOnce).to.be.true;
    });
    it('works with cross module dependencies', function() {
      var dmodule = oaInject.module('depMod1');
      dmodule.Register('dep1', () => 1);
      var module = oaInject.module('mod4', [dmodule]);
      module.Register('dep2', () => 2);
      module.Register('dep3', () => 3);
      var val = {};
      var generator = sinon.fake.returns(val);
      module.Register('val', generator, ['dep1', 'dep2', 'dep3']);
      expect(module.get('dep1')).to.equal(1);
      expect(module.get('dep2')).to.equal(2);
      expect(module.get('dep3')).to.equal(3);
      expect(module.get('val')).to.equal(val);
      expect(generator.calledOnce).to.be.true;
      expect(generator.firstCall.args).to.deep.equal([1,2,3]);
    });
    it('works with cross module dependencies colon notation', function() {
      var dmodule = oaInject.module('depMod2');
      dmodule.Register('dep1', () => 1);
      var module = oaInject.module('mod5', [dmodule]);
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
      des = [
        'v',
        {
          name: 'f',
          functions: {'val.f':[]}
        },
        {
          name: 't',
          types: {'val.t':[]}
        },
        {
          name: 's',
          children: [
            'w',
            {
              name: 'g',
              function: []
            },
            {
              name: 'u',
              type: []
            },
          ]
        },
      ];
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
  it('with', function() {
    var dmodule = oaInject.module('withDepMod');
    dmodule.Register('dep1', () => 1);
    var module = oaInject.module('withMod', [dmodule]);
    module.Register('dep2', () => 2);
    module.Register('dep3', () => 3);
    var val = {};
    var fn = sinon.fake.returns(val);
    module.with(fn, ['withDepMod:dep1', 'dep2', 'dep3']);
    expect(fn.calledOnce).to.be.true;
    expect(fn.firstCall.args).to.deep.equal([1,2,3]);
  });
});

describe('base', function() {
  describe('poset', function() {
    it('works', function() {
      expect(base.get('poset')).to.equal(Poset);
    });
  });

  describe('Math', function() {
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
    it('E', function() {
      expect(abs(base.get('Math.E') - E) < .000001).to.be.true;
    });
    it('LN2', function() {
      expect(abs(base.get('Math.LN2') - LN2) < .000001).to.be.true;
    });
    it('LN10', function() {
      expect(abs(base.get('Math.LN10') - LN10) < .000001).to.be.true;
    });
    it('LOG2E', function() {
      expect(abs(base.get('Math.LOG2E') - LOG2E) < .000001).to.be.true;
    });
    it('LOG10E', function() {
      expect(abs(base.get('Math.LOG10E') - LOG10E) < .000001).to.be.true;
    });
    it('PI', function() {
      expect(abs(base.get('Math.PI') - PI) < .000001).to.be.true;
    });
    it('SQRT1_2', function() {
      expect(abs(base.get('Math.SQRT1_2') - SQRT1_2) < .000001).to.be.true;
    });
    it('SQRT2', function() {
      expect(abs(base.get('Math.SQRT2') - SQRT2) < .000001).to.be.true;
    });
    it('abs', function() {
      for(var i = 0; i < 20; i++) {
        var x = random() * 1000 - 500;
        var e = abs(x);
        var a = base.call('abs', x);
        expect(abs(a - e) < .000001, `abs failed for ${x}. Expected ${e} to equal ${a}`).to.be.true;
      }
    });
  });
  
  describe('Promise', function() {
    it('constructor', function() {
      let p = base.instantiate('Promise', (resolve, reject) => resolve);
      expect(p instanceof Promise).to.be.true;
    });
    it('resolve', function() {
      let p = base.call('resolve', 5);
      expect(p instanceof Promise).to.be.true;
    });
  });
});
