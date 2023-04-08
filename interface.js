let _ = require("lodash");

class Property {
  #name;
  #is_function;
  #is_nullable;
  constructor(name, is_function, is_nullable) {
    this.#name = name;
    this.#is_function = is_function;
    this.#is_nullable = !is_function && is_nullable;
  }
  verify(obj) {
    let v = obj[this.#name];
    if(v == undefined && !this.#is_nullable)
      throw new Error(`obj[${this.#name}] should not be null`);
    if(!_.isFunction(v) && !this.#is_function)
      throw new Error(`obj[${this.#name}] should be a function`);
  }
}

class Interface {
  #properties = [];
  constructor() {
    
  }
  verify(obj) {
    
  }
}

module.exports = {
  Interface
};