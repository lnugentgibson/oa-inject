/* web-start */

class DIValue {
  #module;
  #name;
  #generator;
  #dependencies;
  #odependencies;
  #value;
  #generated = false;
  constructor(module, name, generator, dependencies, odependencies) {
    if(name.includes(':')) throw new Error("name cannot contain ':'");
    this.#module = module;
    this.#name = name;
    this.#generator = generator;
    this.#dependencies = dependencies || [];
    this.#odependencies = odependencies || [];
  }
  get name() { return this.#name; }
  get dependencies() { return this.#dependencies.map(n => n); }
  get odependencies() { return this.#odependencies.map(n => n); }
  get value() { return this.#value; }
  get generated() { return this.#generated; }
  generate(deps) {
    //console.log(`DIValue['${name}'].generate()`);
    //console.log(`DIValue['${name}'].generator`);
    //console.log(generator);
    let val;
    try {
      let ds = this.#dependencies.map((dep,i) => {
        //console.log(`${name} requires ${dep}`);
        return (deps && i < deps.length) ? deps[i] : this.#module.get(dep);
      });
      ds = ds.concat(this.#odependencies.map((dep,i) => {
        //console.log(`${name} requires ${dep}`);
        return (deps && this.#dependencies.length + i < deps.length) ? deps[this.#dependencies.length + i] : this.#module.get(dep);
      }));
      val = this.#generator.apply(null, ds);
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
