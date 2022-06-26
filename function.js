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

/* web-end */

module.exports = {
  DIFunction
};
