/* web-start */

/**
 * Returns a wrapper around the provided function that prepends arguments with
 * the parameters provided similar to the bind function. This function uses the
 * provided module to fetch values from providers at call time.
 */
function prefix(module, f, params) {
  if(params.length == 0) return f;
  function F() {
    var args = params.map(p => {
      let {
        value,
        provider
      } = p;
      if(provider)
        return module.get(provider);
      return value;
    });
    for(var i = 0; i < arguments.length; i++)
      args.push(arguments[i]);
    return f.apply(this, args);
  }
  F.prototype = Object.create(f.prototype);
  
  return F;
}

/**
 * Creates a parameter list in the order they should be placed in the arguments
 * list of a function call. This function also returns a list of gaps.
 */
function order(params) {
  var Params = [];
  params.forEach(param => {
    let {
      index,
      value,
      provider,
      useargs
    } = param;
    if(!useargs)
      Params[index] = {
        value,
        provider
      };
  });
  var unused = [];
  for(var i = 0; i < Params.length; i++) {
    if(!Params[i]) unused.push(i);
  }
  
  return [Params, unused];
}

/**
 * Returns a wrapper around the provided function that reorders arguments with
 * the parameters provided by their specified index. This function uses the
 * provided module to fetch values from providers at call time.
 */
function shuffle(module, f, params) {
  if(params.length == 0) return f;
  let [Params, unused] = order(params);
  if(unused.length == 0) return prefix(module, f, Params);
  function F() {
    var args = Params.map(p => {
      let {
        value,
        provider
      } = p;
      if(provider)
        return module.get(provider);
      return value;
    });
    var i = 0;
    for(var u = 0; u < unused.length && i < arguments.length; u++)
      args[unused[u]] = arguments[i++];
    for(; i < arguments.length; i++)
      args.push(arguments[i]);
    return f.apply(this, args);
  }
  F.prototype = Object.create(f.prototype);
  
  return F;
}

/* web-end */

module.exports = {
  prefix,
  order,
  shuffle
};