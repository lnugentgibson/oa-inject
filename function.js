const {
  shuffle
} = require('./proxy.js');

const {
  DIValue
} = require('./value.js');

/* web-start */

function DIFunction(module, name, src, parameters) {
  function generate() {
    //console.log(`DIFunction['${name}'].generate()`);
    var func = module.get(name);
    return shuffle(module, func, parameters.filter(p => !p.useargs));
  }
  if (!parameters) parameters = [];
  DIValue.call(this, module, name, generate, [src]);
  
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
