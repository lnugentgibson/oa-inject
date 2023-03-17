const {
  shuffle
} = require('./proxy.js');

const {
  DIValue
} = require('./value.js');

/* web-start */

function DIFunction(module, name, src, parameters, bind) {
  let bindVal;
  function generate(func, bind) {
    //console.log(`DIFunction['${name}'].generate()`);
    let F = shuffle(module, func, parameters.filter(p => !p.useargs));
    if(bind) {
      bindVal = bind;
      F = F.bind(bind);
    }
    return F;
  }
  if (!parameters) parameters = [];
  let deps = [src];
  if(bind) {
    if(bind.provider) deps.push(bind.provider);
  }
  DIValue.call(this, module, name, generate, deps);
  
  function call(ctx, ...args) {
    var func = this.get();
    return func.apply(ctx || bindVal, args);
  }
  function callSelf(...args) {
    var func = this.get();
    return func.apply(func, args);
  }
  function apply(ctx, args) {
    var func = this.get();
    return func.apply(ctx || bindVal, args);
  }
  function applySelf(args) {
    var func = this.get();
    return func.apply(func, args);
  }

  Object.defineProperties(this, {
    call: { get: () => call },
    callSelf: { get: () => callSelf },
    apply: { get: () => apply },
    applySelf: { get: () => applySelf }
  });
}

function DIType(module, name, src, parameters) {
  DIFunction.call(this, module, name, src, parameters);
  
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
    instantiate: { get: () => instantiate }
  });
}

/* web-end */

module.exports = {
  DIFunction,
  DIType
};
