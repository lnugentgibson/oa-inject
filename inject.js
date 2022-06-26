//const _ = require("lodash");

const {
  Poset
} = require('./graph.js');

const {
  DIValue,
  DIField
} = require('./value.js');

const {
  DIFunction
} = require('./function.js');

/* web-start */

var modules = {};

function DIModule(name, deps) {
  var This = this;
  modules[name] = This;

  var graph = new Poset();
  var providers = {};
  var functions = {};
  var depTable = {};
  if(deps) deps.forEach(d => depTable[d] = 1);

  function RegisterProvider(name, dependencies, provider) {
    if (dependencies)
      dependencies.forEach(dep => {
        graph.addRelation(name, dep);
      });
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
  }

  function RegisterField(name, parent) {
    RegisterProvider(`${parent}.${name}`, [parent], new DIField(This, name, parent));
  }

  function RegisterFunction(name, src, parameters) {
    if(!providers[src]) throw new Error('no such provider');
    functions[name] = new DIFunction(This, name, src, parameters);
  }
  
  function RegisterObjectFields(name, description) {
    for(const field in description) {
      if(field === 'functions') {
        for(const fn in description.functions) {
          RegisterFunction(fn, name, description.functions[fn]);
        }
      }
      else {
        console.log(`Registering field ${field} of object ${name}`);
        RegisterField(field, name);
        RegisterObjectFields(`${name}.${field}`, description[field]);
      }
    }
  }
  
  function RegisterObject(name, generator, dependencies, description) {
    RegisterValue(name, generator, dependencies);
    RegisterObjectFields(name, description);
  }
  
  function applyFunction(name, ctx, args) {
    var provider = functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.apply(ctx, args);
  }

  function callFunction(name, ctx, ...args) {
    var provider = functions[name];
    if(provider == undefined) throw new Error('provider returns undefined');
    return provider.call(ctx, ...args);
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
    return out;
  }

  function getValue(providerName) {
    try {
      var match = providerName.match(/([^:]+):(.+)/);
      if(match) {
        var dmod = match[1];
        if(!depTable[dmod]) throw new Error(`module ${name} does not depend on module ${dmod}`);
        var dep = modules[dmod];
        return dep.get(match[2]);
      }
      var provider = providers[providerName];
      if (provider)
        return provider.get();
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

  function reloadProvider(name) {
    var provider = providers[name];
    if (provider == undefined && deps)
      for (var i = 0; i < deps.length && provider == undefined; i++)
        provider = deps[i].get(name);
    if (provider == undefined)
      throw new Error(`Provider with name ${name} does not exist`);
    return provider.reload();
  }

  Object.defineProperties(This, {
    name: { get: () => name },
    Register: { get: () => RegisterValue },
    RegisterField: { get: () => RegisterField },
    RegisterFunction: { get: () => RegisterFunction },
    RegisterObject: { get: () => RegisterObject },
    Alias: { get: () => Alias },
    get: { get: () => getValue },
    apply: { get: () => applyFunction },
    call: { get: () => callFunction },
    getProviders: { get: () => getProviders },
    reload: { get: () => reloadProvider }
  });
}

/* web-end */

module.exports = {
  DIModule
};
