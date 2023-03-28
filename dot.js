const oaInject = require("./inject.js");
const base = oaInject.getModule('base');

//console.log(base.getProviders());
console.log(base.dot({
  name_func(name) {
    name = name.replace(/:/g, '_');
    name = name.replace(/\./g, '_');
    return name;
  }
}));