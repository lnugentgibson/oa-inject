const _ = require("lodash");

const {
  Comparator,
  ArrayLib,
  SortedArray
} = require('./array.js');

const {
  Poset
} = require('./graph.js');

const {
  DIValue,
  DIField
} = require('./value.js');

const {
  DIFunction,
  DIType
} = require('./function.js');

/* web-start */

var modules = {};

class DIModule {
  #name;
  #graph = new Poset();
  #providers = {};
  #functions = {};
  #types = {};
  #dependencies;
  #depTable = {};
  constructor(name, deps) {
    this.#name = name;
    modules[name] = this;
  
    if(deps)
      deps.forEach(d => {
        if(!(d instanceof DIModule)) throw new Error('dependencies must be modules');
        this.#depTable[d.name] = d;
      });
    else {
      deps = [];
    }
    if(name != 'base') {
      deps.splice(0, 0, modules['base']);
      this.#depTable['base'] = deps[0];
    }
    this.#dependencies = deps;
  }
  get name() { return this.#name; }
  #RegisterProvider(name, dependencies, provider) {
    // get previous provider
    var o = this.#providers[name];
    this.#providers[name] = provider;
    // if previous provider exists any generated descendants need to reload
    // with new provider
    if (o) {
      this.#graph.decendants(name).forEach(n => {
        var provider = this.#providers[n];
        if (provider.generated) provider.reload();
      });
    }
  }
  Register(name, generator, dependencies) {
    if(name.includes('.')) throw new Error("name cannot contain '.'");
    this.#RegisterProvider(name, dependencies, new DIValue(this, name, generator, dependencies));
    return this;
  }
  RegisterField(name, parent, bind) {
    this.#RegisterProvider(`${parent}.${name}`, [parent], new DIField(this, name, parent, bind));
    return this;
  }
  RegisterFunction(name, src, parameters, bind) {
    if(!this.#providers[src]) throw new Error('no such provider');
    this.#functions[name] = new DIFunction(this, name, src, parameters, bind);
    return this;
  }
  RegisterType(name, src, parameters) {
    if(!this.#providers[src]) throw new Error('no such provider');
    this.#types[name] = new DIType(this, name, src, parameters);
    return this;
  }
  #RegisterObjectFields(name, description) {
    description.forEach(descriptor => {
      if(_.isString(descriptor)) {
        let field = descriptor;
        this.RegisterField(field, name);
      }
      else {
        let {name: field, function: func, functions, type, types, children, bind} = descriptor;
        this.RegisterField(field, name, bind);
        if(func) {
          this.RegisterFunction(field, `${name}.${field}`, func);
        }
        else if(functions)
          for(const fn in functions) {
            this.RegisterFunction(fn, `${name}.${field}`, functions[fn]);
          }
        if(type) {
          this.RegisterType(field, `${name}.${field}`, type);
        }
        else if(types)
          for(const tn in types) {
            this.RegisterType(tn, `${name}.${field}`, types[tn]);
          }
        if(children)
          this.#RegisterObjectFields(`${name}.${field}`, children);
      }
    });
  }
  RegisterObject(name, generator, dependencies, description) {
    this.Register(name, generator, dependencies);
    this.#RegisterObjectFields(name, description);
    return this;
  }
  apply(name, args) {
    var provider = this.#functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.apply(null, args);
  }
  Apply(name, ctx, args) {
    var provider = this.#functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.apply(ctx, args);
  }
  applySelf(name, args) {
    var provider = this.#functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.applySelf(args);
  }
  call(name, ...args) {
    var provider = this.#functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.call(null, ...args);
  }
  Call(name, ctx, ...args) {
    var provider = this.#functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.call(ctx, ...args);
  }
  callSelf(name, ...args) {
    var provider = this.#functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.callSelf(...args);
  }
  instantiate(name, ...args) {
    var provider = this.#types[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.instantiate(...args);
  }
  Alias(name, alias) {
    var provider = this.#providers[name];
    this.#RegisterProvider(alias, provider.dependencies, provider);
  }
  getProviders() {
    let out = Object.keys(this.#providers);
    for(const fn in this.#functions) {
      out.push(fn + '()');
    }
    for(const tn in this.#types) {
      out.push(tn + '{}');
    }
    return out;
  }
  #generateDependencies(provider, overrides, values) {
    let {dependencies} = provider;
    let ds;
    if (dependencies)
      ds = dependencies.map(dep => {
        if(values) {
          let val = values[dep];
          if(val != undefined) return val;
        }
        if(overrides) {
          var odep = overrides[dep];
          if(odep) dep = odep;
        }
        this.#graph.addRelation(provider.name, dep);
        return this.get(dep);
      });
    //*/
    return ds;
  }
  #generate(provider, overrides, values) {
    let ds = this.#generateDependencies(provider, overrides, values);
    return provider.generate(ds);
  }
  gen(providerName, overrides, values) {
    try {
      var match = providerName.match(/([^:]+):(.+)/);
      if(match) {
        var dmod = match[1];
        if(!this.#depTable[dmod]) throw new Error(`module ${this.#name} does not depend on module ${dmod}`);
        var dep = modules[dmod];
        return dep.gen(match[2]);
      }
      var provider = this.#providers[providerName];
      if (provider) {
        return this.#generate(provider, overrides, values);
      }
      if (this.#dependencies.length)
        for (var i = 0; i < this.#dependencies.length && provider == undefined; i++) {
          if (!modules[this.#dependencies[i]]) {
            throw `module ${this.#name} depends on missing module ${this.#dependencies[i]}`;
          }
          try {
            return modules[this.#dependencies[i]].gen(providerName);
          }
          catch (err) {}
        }
      var names = this.getProviders();
      if (this.#dependencies.length)
        this.#dependencies.forEach(dep => {
          var Dep = modules[dep];
          names = names.concat(Dep.getProviders().map(n => dep + ':' + n));
        });
      throw new Error(`Provider with name ${providerName} does not exist.\nAvailable providers: ${names.join(', ')}`);
    }
    catch (err) {
      throw err;
    }
  }
  #provide(provider, overrides, values) {
    let ds = this.#generateDependencies(provider, overrides, values);
    return provider.get(ds);
  }
  get(providerName, overrides, values) {
    try {
      var match = providerName.match(/([^:]+):(.+)/);
      if(match) {
        var dmod = match[1];
        if(!this.#depTable[dmod]) throw new Error(`module ${this.#name} does not depend on module ${dmod}`);
        var dep = this.#depTable[dmod];
        return dep.get(match[2], overrides, values);
      }
      var provider = this.#providers[providerName];
      if (provider) {
        return this.#provide(provider, overrides, values);
      }
      if (this.#dependencies.length) {
        let o;
        if(this.#dependencies.some(D => {
          if (!D) {
            throw `module ${this.#name} depends on missing module`;
          }
          try {
            o = D.get(providerName, overrides, values);
            return true;
          }
          catch (err) {}
          return false;
        })) return o;
      }
      var names = this.getProviders();
      if (this.#dependencies.length)
        this.#dependencies.forEach(dep => {
          names = names.concat(dep.getProviders().map(n => dep.name + ':' + n));
        });
      throw new Error(`Provider with name ${providerName} does not exist.\nAvailable providers: ${names.join(', ')}`);
    }
    catch (err) {
      throw err;
    }
  }
  reload(providerName, overrides, values) {
    var provider = this.#providers[providerName];
    if (provider == undefined && this.#dependencies.length)
      for (var i = 0; i < this.#dependencies.length && provider == undefined; i++)
        provider = this.#dependencies[i].get(providerName);
    if (provider == undefined)
      throw new Error(`Provider with name ${providerName} does not exist`);
    return this.#provide(provider, overrides, values);
  }
  with(fn, dependencies) {
    fn.apply(null, dependencies.map(d => this.get(d)));
  }
  dot(opt) {
    let graph = new Poset();
    for(const [name, provider] of Object.entries(this.#providers)) {
      graph.add(name);
      if(provider.dependencies)
        provider.dependencies.forEach(dep => {
          graph.addRelation(name, dep);
        });
    }
    return graph.dot(opt);
  }
}

const oaInject = {
  module(name, dependencies) {
    if(modules[name]) throw new Error('module already exists');
    return new DIModule(name, dependencies);
  },
  getModule(name) {
    return modules[name];
  }
};

const base = oaInject.module('base', []);

base.Register('_', () => _, []);

base.Register('Array', () => Array, []);
base.Register('Map', () => Map, []);
base.RegisterObject('Math', () => Math, [], [
  'E',
  'LN2',
  'LN10',
  'LOG2E',
  'LOG10E',
  'PI',
  'SQRT1_2',
  'SQRT2',
  
  {name: 'abs', function: []},
  {name: 'ceil', function: []},
  {name: 'floor', function: []},
  {name: 'fround', function: []},
  {name: 'round', function: []},
  {name: 'max', function: []},
  {name: 'min', function: []},
  {name: 'sign', function: []},
  {name: 'trunc', function: []},
  
  {name: 'acos', function: []},
  {name: 'acosh', function: []},
  {name: 'asin', function: []},
  {name: 'asinh', function: []},
  {name: 'atan', function: []},
  {name: 'atanh', function: []},
  {name: 'cos', function: []},
  {name: 'cosh', function: []},
  {name: 'sin', function: []},
  {name: 'sinh', function: []},
  {name: 'tan', function: []},
  {name: 'tanh', function: []},
  
  {name: 'cbrt', function: []},
  {name: 'sqrt', function: []},
  {name: 'hypot', function: []},
  
  {name: 'exp', function: []},
  {name: 'expm1', function: []},
  {name: 'log', function: []},
  {name: 'log1p', function: []},
  {name: 'log10', function: []},
  {name: 'log2', function: []},
  {name: 'pow', function: []},
  
  {name: 'random', function: []},
  
  {name: 'clz32', function: []},
  {name: 'imul', function: []},
]);
base.Register('Object', () => Object, []);
base.RegisterObject('Promise', () => Promise, [], [
  {name: 'resolve', function: [], bind: true},
]);
base.RegisterType('Promise', 'Promise');

base.Register('comparator', () => Comparator, []);
base.Register('arrayLib', () => ArrayLib, []);
base.Register('sortedArray', () => SortedArray, []);
base.Register('poset', () => Poset, []);

/* web-end */

module.exports = oaInject;
