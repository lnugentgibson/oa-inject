//const _ = require("lodash");

const {
  shuffle
} = require('./proxy.js');

/* web-start */

function DependencyGraph() {
  var nodes = {};

  function depends(src, dst) {
    var node = nodes[src];
    if (!node) return false;
    var dependencies = {
        [src]: 1
      },
      queue = [node];
    while (queue.length > 0) {
      node = queue.splice(0, 1)[0];
      Object.keys(node.out).forEach(n => {
        if (n == dst) return true;
        if (!dependencies[n]) queue.push(nodes[n]);
        else dependencies[n] = 1;
      });
    }
    return false;
  }

  function dependencies(name) {
    var node = nodes[name];
    if (!node) return [];
    var dependencies = {
        [name]: 1
      },
      queue = [node],
      ordered = [];
    while (queue.length > 0) {
      node = queue.splice(0, 1)[0];
      Object.keys(node.out).forEach(n => {
        if (!dependencies[n]) queue.push(nodes[n]);
        else {
          dependencies[n] = 1;
          ordered.push(n);
        }
      });
    }
    return ordered;
  }

  function dependents(name) {
    var node = nodes[name];
    if (!node) return [];
    var dependencies = {
        [name]: 1
      },
      queue = [node],
      ordered = [];
    while (queue.length > 0) {
      node = queue.splice(0, 1)[0];
      Object.keys(node.in).forEach(n => {
        if (!dependencies[n]) queue.push(nodes[n]);
        else {
          dependencies[n] = 1;
          ordered.push(n);
        }
      });
    }
    return ordered;
  }

  function addDependency(src, dst) {
    if (depends(dst, src)) throw new Error('cyclic dependency');
    var Src = nodes[src];
    if (!Src) Src = nodes[src] = {
      out: {},
      in: {}
    };
    var Dst = nodes[dst];
    if (!Dst) Dst = nodes[dst] = {
      out: {},
      in: {}
    };
    Src.out[dst] = 1;
    Dst.in[src] = 1;
  }

  Object.defineProperties(this, {
    depends: { get: () => depends },
    dependencies: { get: () => dependencies },
    dependents: { get: () => dependents },
    addDependency: { get: () => addDependency },
  });
}

function DIValue(module, name, type, generator, dependencies) {
  var value;
  var generated = false;

  function generate() {
    //console.log(`DIValue['${name}'].generate()`);
    //console.log(`DIValue['${name}'].generator`);
    //console.log(generator);
    if (dependencies)
      value = generator.apply(null, dependencies.map(dep => {
        //console.log(`${name} requires ${dep}`);
        return module.get(dep);
      }));
    else
      value = generator.call(null);
    //console.log(`DIValue['${name}'].value`);
    generated = true;
    //console.log(value);
  }

  Object.defineProperties(this, {
    name: {
      get: () => name
    },
    type: {
      get: () => type
    },
    dependencies: {
      get: () => dependencies.map(n => n)
    },
    generated: {
      get: () => generated
    },
    generate: {
      get: () => generate
    },
    get: {
      get: () => {
        return () => {
          //console.log(`DIValue['${name}'].get()`);
          if (!generated) generate();
          return value;
        };
      }
    },
    reload: {
      get: () => (() => {
        generate();
        return value;
      })
    },
    value: {
      get: () => value
    }
  });
}

function DIService(module, name, type, generator, dependencies) {
  DIValue.call(this, module, name, type, generator, dependencies);
}

function DIServiceCall() {}

function DIFunction(module, name, type, parameters, generator, dependencies) {
  function generate() {
    //console.log(`DIFunction['${name}'].generate()`);
    var func = generator.apply(null, arguments);

    /*
    function F() {
      var ret = parameters.reduce((ai, p) => {
        let [as, j, k] = ai;
        let { index, component, value, useargs } = p;
        while (j < index) {
          if (k < arguments.length) as.push(arguments[k++]);
          else as.push(undefined);
          j++;
        }
        if (useargs) {
          if (k < arguments.length) as.push(arguments[k++]);
          else as.push(undefined);
        }
        else if (component) as.push(module.get(component));
        else as.push(value);
        return [as, j + 1, k];
      }, [
        [], 0, 0
      ]);
      var args = ret[0];
      var i = ret[2];
      while (i < arguments.length) args.push(arguments[i++]);
      return func.apply(null, args);
    }
    //*/
    return shuffle(module, func, parameters.filter(p => !p.useargs));
  }
  //DIValue.call(this, module, name, type, generate, dependencies);
  DIValue.call(this, module, name, type, Function.bind.apply(generator, parameters), dependencies);
  if (!parameters) parameters = [];

  function call(ctx, ...args) {
    var func = this.get();
    return func.apply(ctx, args);
  }
  function apply(ctx, args) {
    var func = this.get();
    return func.apply(ctx, args);
  }

  Object.defineProperties(this, {
    call: { get: () => call },
    apply: { get: () => apply }
  });
}

function DIBoundFunction(module, name, type, parameters, func) {
  function generate(f) {

  }
  DIValue.call(this, module, name, type, generate, [func]);
  if (!parameters) parameters = [];

  function call() {
    var func = this.get();
    var ret = parameters.reduce((ai, p) => {
      let [as, j, k] = ai;
      let { index, component, value, useargs } = p;
      while (j < index) {
        if (k < arguments.length) as.push(arguments[k++]);
        else as.push(undefined);
        j++;
      }
      if (useargs) {
        if (k < arguments.length) as.push(arguments[k++]);
        else as.push(undefined);
      }
      else if (component) as.push(module.get(component));
      else as.push(value);
      return [as, j + 1, k];
    }, [
      [], 0, 1
    ]);
    var args = ret[0];
    var i = ret[2];
    while (i < arguments.length) args.push(arguments[i++]);
    return func.apply(arguments[0, 1], args);
  }

  Object.defineProperties(this, {
    call: {
      get: () => call
    },
  });
}

function DIFunctionCall() {}

function DIConstructor(module, name, type, parameters, generator, dependencies) {
  DIFunction.call(this, module, name, type, parameters, generator, dependencies);
  if (!parameters) parameters = [];

  function instantiate() {
    var func = this.get();
    var args = [undefined];
    for(var i = 0; i < arguments.length; i++)
      args.push(arguments[i]);
    var F = Function.prototype.bind.apply(func, args);
    F.prototype = Object.create(func.prototype);
    return new F();
  }

  Object.defineProperties(this, {
    instantiate: {
      get: () => instantiate
    },
  });
}

function DIBoundConstructor() {}

function DIInstance() {}

var modules = {};

function DIModule(name, deps) {
  modules[name] = this;

  var graph = new DependencyGraph();
  var providers = {},
    services = {},
    functions = {},
    types = {};

  function RegisterProvider(name, dependencies, provider) {
    if (dependencies)
      dependencies.forEach(dep => {
        graph.addDependency(name, dep);
      });
    var o = providers[name];
    providers[name] = provider;
    if (o) {
      graph.dependents(name).forEach(n => {
        var provider = providers[n];
        if (provider.generated) provider.reload();
      });
      switch (o.type) {
        case "service":
          if (provider.type != "service") delete services[name];
          break;
        case "function":
          if (provider.type != "function") delete functions[name];
          break;
        case "type":
          if (provider.type != "type") delete types[name];
          break;
      }
    }
    switch (provider.type) {
      case "service":
        services[name] = provider;
        break;
      case "function":
        functions[name] = provider;
        break;
      case "type":
        types[name] = provider;
        break;
    }
  }

  function RegisterValue(name, generator, dependencies) {
    RegisterProvider(name, dependencies, new DIValue(this, name, 'value', generator, dependencies));
  }

  function RegisterService(name, generator, dependencies) {
    RegisterProvider(name, dependencies, new DIService(this, name, 'service', generator, dependencies));
  }

  function RegisterFunction(name, parameters, generator, dependencies) {
    RegisterProvider(name, dependencies, new DIFunction(this, name, 'function', parameters, generator, dependencies));
  }

  function RegisterConstructor(name, parameters, generator, dependencies) {
    RegisterProvider(name, dependencies, new DIConstructor(this, name, 'type', parameters, generator, dependencies));
  }

  function Alias(name, alias) {
    var provider = providers[name];
    RegisterProvider(alias, provider.dependencies, provider);
  }
  
  function getProviders() {
    return Object.keys(providers);
  }

  function getProvider(providerName) {
    var provider = providers[providerName];
    if (provider == undefined && deps)
      for (var i = 0; i < deps.length && provider == undefined; i++) {
        if(!modules[deps[i]]) {
          throw `module ${name} depends on missing module ${deps[i]}`;
        }
        try {
          provider = modules[deps[i]].getProvider(providerName);
        }
        catch(err) {
          provider = undefined;
        }
      }
    if (provider == undefined) {
      var names = getProviders();
      if(deps)
        deps.forEach(dep => {
          var Dep = modules[dep];
          names = names.concat(Dep.getProviders().map(n => dep + ':' + n));
        });
      throw new Error(`Provider with name ${providerName} does not exist.\nAvailable providers: ${names.join(', ')}`);
    }
    return provider;
  }

  function getValue(name) {
    try {
      return getProvider(name).get();
    }
    catch(err) {
      console.error(`Error getting value for ${name}`);
      throw err;
    }
  }
  
  function callFunction(name, ctx, ...args) {
    var provider = getProvider(name);
    if(provider == undefined) throw new Error('provider returns undefined');
    if(provider.type != 'function') throw new Error('provider is not a function');
    return provider.call(ctx, ...args);
  }
  
  function applyFunction(name, ctx, args) {
    var provider = getProvider(name);
    if(provider == undefined) throw new Error('provider returns undefined');
    if(provider.type != 'function') throw new Error('provider is not a function');
    return provider.apply(ctx, args);
  }
  
  function callConstructor(name, ...args) {
    var provider = getProvider(name);
    if(provider == undefined) throw new Error(`provider returns undefined(name: ${name})`);
    if(provider.type != 'type') throw new Error(`provider is not a type(name: ${name}, type: ${provider.type})`);
    return provider.instantiate(...args);
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
    RegisterValue: { get: () => RegisterValue },
    RegisterService: { get: () => RegisterService },
    RegisterFunction: { get: () => RegisterFunction },
    RegisterConstructor: { get: () => RegisterConstructor },
    Alias: { get: () => Alias },
    get: { get: () => getValue },
    getProvider: { get: () => getProvider },
    getProviders: { get: () => getProviders },
    call: { get: () => callFunction },
    apply: { get: () => applyFunction },
    instantiate: { get: () => callConstructor },
    reload: { get: () => reloadProvider }
  });
}

/* web-end */

module.exports = {
  DIValue,
  DIService,
  DIFunction,
  DIConstructor,
  DIModule
};
