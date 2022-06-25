//const _ = require("lodash");

const {
  Poset
} = require('./graph.js');

const {
  DIValue
} = require('./value.js');

/* web-start */

var modules = {};

function DIModule(name, deps) {
  modules[name] = this;

  var graph = new Poset();
  var providers = {};
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
    RegisterProvider(name, dependencies, new DIValue(this, name, 'value', generator, dependencies));
  }

  function Alias(name, alias) {
    var provider = providers[name];
    RegisterProvider(alias, provider.dependencies, provider);
  }

  function getProviders() {
    return Object.keys(providers);
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

  Object.defineProperties(this, {
    Register: { get: () => RegisterValue },
    Alias: { get: () => Alias },
    get: { get: () => getValue },
    getProviders: { get: () => getProviders },
    reload: { get: () => reloadProvider }
  });
}

/* web-end */

module.exports = {
  DIModule
};
