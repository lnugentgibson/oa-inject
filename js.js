const oaInject = require('./inject.js');

/* web-start */

oaInject.module('builtin', [])
.RegisterObject('Math', () => Math, [], {
  E: 1,
  LN2: 1,
  LN10: 1,
  LOG2E: 1,
  LOG10E: 1,
  PI: 1,
  SQRT1_2: 1,
  SQRT2: 1,
  
  abs: {functions: {abs: []}},
  ceil: {functions: {ceil: []}},
  floor: {functions: {floor: []}},
  fround: {functions: {fround: []}},
  round: {functions: {round: []}},
  max: {functions: {max: []}},
  min: {functions: {min: []}},
  sign: {functions: {sign: []}},
  trunc: {functions: {trunc: []}},
  
  acos: {functions: {acos: []}},
  acosh: {functions: {acosh: []}},
  asin: {functions: {asin: []}},
  asinh: {functions: {asinh: []}},
  atan: {functions: {atan: []}},
  atanh: {functions: {atanh: []}},
  cos: {functions: {cos: []}},
  cosh: {functions: {cosh: []}},
  sin: {functions: {sin: []}},
  sinh: {functions: {sinh: []}},
  tan: {functions: {tan: []}},
  tanh: {functions: {tanh: []}},
  
  cbrt: {functions: {cbrt: []}},
  sqrt: {functions: {sqrt: []}},
  hypot: {functions: {hypot: []}},
  
  exp: {functions: {exp: []}},
  expm1: {functions: {exm1p: []}},
  log: {functions: {log: []}},
  log1p: {functions: {log1p: []}},
  log10: {functions: {log10: []}},
  log2: {functions: {log2: []}},
  pow: {functions: {pow: []}},
  
  random: {functions: {random: []}},
  
  clz32: {functions: {clz32: []}},
  imul: {functions: {imul: []}},
});

/* web-end */