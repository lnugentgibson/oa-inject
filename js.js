const oaInject = require('./inject.js');

/* web-start */

oaInject.module('builtin', [])
.RegisterObject('Math', () => Math, [], [
  'E',
  'LN2',
  'LN10',
  'LOG2E',
  'LOG10E',
  'PI',
  'SQRT1_2',
  'SQRT2',
  
  {name: 'abs', function: []},
  {name: 'ceil', function: []},
  {name: 'floor', function: []},
  {name: 'fround', function: []},
  {name: 'round', function: []},
  {name: 'max', function: []},
  {name: 'min', function: []},
  {name: 'sign', function: []},
  {name: 'trunc', function: []},
  
  {name: 'acos', function: []},
  {name: 'acosh', function: []},
  {name: 'asin', function: []},
  {name: 'asinh', function: []},
  {name: 'atan', function: []},
  {name: 'atanh', function: []},
  {name: 'cos', function: []},
  {name: 'cosh', function: []},
  {name: 'sin', function: []},
  {name: 'sinh', function: []},
  {name: 'tan', function: []},
  {name: 'tanh', function: []},
  
  {name: 'cbrt', function: []},
  {name: 'sqrt', function: []},
  {name: 'hypot', function: []},
  
  {name: 'exp', function: []},
  {name: 'expm1', function: []},
  {name: 'log', function: []},
  {name: 'log1p', function: []},
  {name: 'log10', function: []},
  {name: 'log2', function: []},
  {name: 'pow', function: []},
  
  {name: 'random', function: []},
  
  {name: 'clz32', function: []},
  {name: 'imul', function: []},
]);

/* web-end */