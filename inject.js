//const _ = require("lodash");

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

function DIModule(name, deps) {
  var This = this;
  modules[name] = This;

  var graph = new Poset();
  var providers = {};
  var functions = {};
  var types = {};
  var depTable = {};
  if(deps) deps.forEach(d => depTable[d] = 1);

  function RegisterProvider(name, dependencies, provider) {
    /*
    if (dependencies)
      dependencies.forEach(dep => {
        graph.addRelation(name, dep);
      });
    //*/
    var o = providers[name];
    providers[name] = provider;
    if (o) {
      graph.ancestors(name).forEach(n => {
        var provider = providers[n];
        if (provider.generated) provider.reload();
      });
    }
  }

  function RegisterValue(name, generator, dependencies) {
    if(name.includes('.')) throw new Error("name cannot contain '.'");
    RegisterProvider(name, dependencies, new DIValue(This, name, generator, dependencies));
    return This;
  }

  function RegisterField(name, parent) {
    RegisterProvider(`${parent}.${name}`, [parent], new DIField(This, name, parent));
    return This;
  }

  function RegisterFunction(name, src, parameters) {
    if(!providers[src]) throw new Error('no such provider');
    functions[name] = new DIFunction(This, name, src, parameters);
    return This;
  }

  function RegisterType(name, src, parameters) {
    if(!providers[src]) throw new Error('no such provider');
    types[name] = new DIType(This, name, src, parameters);
    return This;
  }
  
  function RegisterObjectFields(name, description) {
    description.forEach(descriptor => {
      if(typeof descriptor === 'string' || descriptor instanceof String) {
        var field = descriptor;
        RegisterField(field, name);
      }
      else {
        let {name: field, function: func, functions, type, types, children} = descriptor;
        RegisterField(field, name);
        if(func) {
          RegisterFunction(field, `${name}.${field}`, func);
        }
        else if(functions)
          for(const fn in functions) {
            RegisterFunction(fn, `${name}.${field}`, functions[fn]);
          }
        if(type) {
          RegisterType(field, `${name}.${field}`, type);
        }
        else if(types)
          for(const tn in types) {
            RegisterType(tn, `${name}.${field}`, types[tn]);
          }
        if(children)
          RegisterObjectFields(`${name}.${field}`, children);
      }
    });
  }
  
  function RegisterObject(name, generator, dependencies, description) {
    RegisterValue(name, generator, dependencies);
    RegisterObjectFields(name, description);
    return This;
  }
  
  function applyFunction(name, args) {
    var provider = functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.apply(null, args);
  }

  function ApplyFunction(name, ctx, args) {
    var provider = functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.apply(ctx, args);
  }

  function callFunction(name, ...args) {
    var provider = functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.call(null, ...args);
  }
  
  function CallFunction(name, ctx, ...args) {
    var provider = functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.call(ctx, ...args);
  }
  
  function instantiateType(name, ...args) {
    var provider = types[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.instantiate(...args);
  }
  
  function Alias(name, alias) {
    var provider = providers[name];
    RegisterProvider(alias, provider.dependencies, provider);
  }

  function getProviders() {
    var out = Object.keys(providers);
    for(const fn in functions) {
      out.push(fn + '()');
    }
    for(const tn in types) {
      out.push(tn + '{}');
    }
    return out;
  }
  
  function generateDependencies(provider, overrides, values) {
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
        graph.addRelation(provider.name, dep);
        return getValue(dep);
      });
    //*/
    return ds;
  }
  
  function generate(provider, overrides, values) {
    let ds = generateDependencies(provider, overrides, values);
    return provider.generate(ds);
  }

  function genValue(providerName, overrides, values) {
    try {
      var match = providerName.match(/([^:]+):(.+)/);
      if(match) {
        var dmod = match[1];
        if(!depTable[dmod]) throw new Error(`module ${name} does not depend on module ${dmod}`);
        var dep = modules[dmod];
        return dep.gen(match[2]);
      }
      var provider = providers[providerName];
      if (provider) {
        return generate(provider, overrides, values);
      }
      if (deps)
        for (var i = 0; i < deps.length && provider == undefined; i++) {
          if (!modules[deps[i]]) {
            throw `module ${name} depends on missing module ${deps[i]}`;
          }
          try {
            return modules[deps[i]].gen(providerName);
          }
          catch (err) {}
        }
      var names = getProviders();
      if (deps)
        deps.forEach(dep => {
          var Dep = modules[dep];
          names = names.concat(Dep.getProviders().map(n => dep + ':' + n));
        });
      throw new Error(`Provider with name ${providerName} does not exist.\nAvailable providers: ${names.join(', ')}`);
    }
    catch (err) {
      throw err;
    }
  }
  
  function provide(provider, overrides, values) {
    let ds = generateDependencies(provider, overrides, values);
    return provider.get(ds);
  }

  function getValue(providerName, overrides, values) {
    try {
      var match = providerName.match(/([^:]+):(.+)/);
      if(match) {
        var dmod = match[1];
        if(!depTable[dmod]) throw new Error(`module ${name} does not depend on module ${dmod}`);
        var dep = modules[dmod];
        return dep.get(match[2]);
      }
      var provider = providers[providerName];
      if (provider) {
        return provide(provider, overrides, values);
      }
      if (deps)
        for (var i = 0; i < deps.length && provider == undefined; i++) {
          if (!modules[deps[i]]) {
            throw `module ${name} depends on missing module ${deps[i]}`;
          }
          try {
            return modules[deps[i]].get(providerName);
          }
          catch (err) {}
        }
      var names = getProviders();
      if (deps)
        deps.forEach(dep => {
          var Dep = modules[dep];
          names = names.concat(Dep.getProviders().map(n => dep + ':' + n));
        });
      throw new Error(`Provider with name ${providerName} does not exist.\nAvailable providers: ${names.join(', ')}`);
    }
    catch (err) {
      throw err;
    }
  }

  function reloadProvider(providerName, overrides, values) {
    var provider = providers[providerName];
    if (provider == undefined && deps)
      for (var i = 0; i < deps.length && provider == undefined; i++)
        provider = deps[i].get(providerName);
    if (provider == undefined)
      throw new Error(`Provider with name ${providerName} does not exist`);
    return provide(provider, overrides, values);
  }

  Object.defineProperties(This, {
    name: { get: () => name },
    Register: { get: () => RegisterValue },
    RegisterField: { get: () => RegisterField },
    RegisterFunction: { get: () => RegisterFunction },
    RegisterType: { get: () => RegisterType },
    RegisterObject: { get: () => RegisterObject },
    Alias: { get: () => Alias },
    get: { get: () => getValue },
    gen: { get: () => genValue },
    apply: { get: () => applyFunction },
    Apply: { get: () => ApplyFunction },
    call: { get: () => callFunction },
    Call: { get: () => CallFunction },
    instantiate: { get: () => instantiateType },
    getProviders: { get: () => getProviders },
    reload: { get: () => reloadProvider }
  });
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

/* web-end */

module.exports = oaInject;
