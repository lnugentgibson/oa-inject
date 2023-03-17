/* web-start */

class DIValue {
  #module;
  #name;
  #generator;
  #dependencies;
  #value;
  #generated = false;
  constructor(module, name, generator, dependencies) {
    if(name.includes(':')) throw new Error("name cannot contain ':'");
    this.#module = module;
    this.#name = name;
    this.#generator = generator;
    this.#dependencies = dependencies || [];
  }
  get name() { return this.#name; }
  get dependencies() { return this.#dependencies.map(n => n); }
  get value() { return this.#value; }
  get generated() { return this.#generated; }
  generate(deps) {
    //console.log(`DIValue['${name}'].generate()`);
    //console.log(`DIValue['${name}'].generator`);
    //console.log(generator);
    let val;
    try {
    if (this.#dependencies)
      val = this.#generator.apply(null, this.#dependencies.map((dep,i) => {
        //console.log(`${name} requires ${dep}`);
        return (deps && i < deps.length) ? deps[i] : this.#module.get(dep);
      }));
    else
      val = this.#generator.call(null);
    }
    catch(err) {
      console.error(`module = ${this.#module.name}`);
      console.error(`value name = ${this.#name}`);
      console.error(`value dependencies = ${this.#dependencies.join()}`);
      throw err;
    }
    //console.log(`DIValue['${name}'].value`);
    this.#generated = true;
    //console.log(value);
    return val;
  }
  get(deps) {
    //console.log(`DIValue['${name}'].get()`);
    if (!this.#generated) this.#value = this.generate(deps);
    return this.#value;
  }
  reload(deps) {
    this.#value = this.generate(deps);
    return this.#value;
  }
}

class DIField extends DIValue {
  constructor(module, name, parent, bind = false) {
    super(module, `${parent}.${name}`, p => {
      if(bind)
        return p[name].bind(p);
      else
        return p[name];
    }, [parent]);
  }
}

/* web-end */

module.exports = {
  DIValue,
  DIField
};
