const {
  shuffle
} = require('./proxy.js');

const {
  DIValue
} = require('./value.js');

/* web-start */

function DIFunction(module, name, src, parameters) {
  function generate(func) {
    //console.log(`DIFunction['${name}'].generate()`);
    return shuffle(module, func, parameters.filter(p => !p.useargs));
  }
  if (!parameters) parameters = [];
  DIValue.call(this, module, name, generate, [src]);
  
  function call(ctx, ...args) {
    var func = this.get();
    return func.apply(ctx, args);
  }
  function callSelf(...args) {
    var func = this.get();
    return func.apply(func, args);
  }
  function apply(ctx, args) {
    var func = this.get();
    return func.apply(ctx, args);
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
