const {
  shuffle
} = require('./proxy.js');

const {
  DIValue
} = require('./value.js');

/* web-start */

class DIFunction extends DIValue {
  #bindVal;
  constructor(module, name, src, parameters, bind) {
    function generate(func, bind) {
      //console.log(`DIFunction['${name}'].generate()`);
      let F = shuffle(module, func, parameters.filter(p => !p.useargs));
      if(bind) {
        this.#bindVal = bind;
        F = F.bind(bind);
      }
      return F;
    }
    if (!parameters) parameters = [];
    let deps = [src];
    if(bind) {
      if(bind.provider) deps.push(bind.provider);
    }
    super(module, name, generate, deps);
  }
  call(ctx, ...args) {
    let func = this.get();
    return func.apply(ctx || this.#bindVal, args);
  }
  callSelf(...args) {
    let func = this.get();
    return func.apply(func, args);
  }
  apply(ctx, args) {
    let func = this.get();
    return func.apply(ctx || this.#bindVal, args);
  }
  applySelf(args) {
    let func = this.get();
    return func.apply(func, args);
  }
}

class DIType extends DIFunction {
  constructor(module, name, src, parameters) {
    super(module, name, src, parameters);
  }
  instantiate() {
    let func = this.get();
    let args = [undefined];
    for(let i = 0; i < arguments.length; i++)
      args.push(arguments[i]);
    let F = Function.prototype.bind.apply(func, args);
    F.prototype = Object.create(func.prototype);
    return new F();
  }
}

/* web-end */

module.exports = {
  DIFunction,
  DIType
};
