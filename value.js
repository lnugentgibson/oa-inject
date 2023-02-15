/* web-start */

function DIValue(module, name, generator, dependencies) {
  if(name.includes(':')) throw new Error("name cannot contain ':'");
  
  var value;
  var generated = false;

  function generate(deps) {
    //console.log(`DIValue['${name}'].generate()`);
    //console.log(`DIValue['${name}'].generator`);
    //console.log(generator);
    let val;
    try {
    if (dependencies)
      val = generator.apply(null, dependencies.map((dep,i) => {
        //console.log(`${name} requires ${dep}`);
        return (deps && i < deps.length) ? deps[i] : module.get(dep);
      }));
    else
      val = generator.call(null);
    }
    catch(err) {
      console.error(`module = ${module.name}`);
      console.error(`value name = ${name}`);
      console.error(`value dependencies = ${dependencies.join()}`);
      throw err;
    }
    //console.log(`DIValue['${name}'].value`);
    generated = true;
    //console.log(value);
    return val;
  }

  Object.defineProperties(this, {
    name: {
      get: () => name
    },
    dependencies: {
      get: () => dependencies ? dependencies.map(n => n) : []
    },
    generated: {
      get: () => generated
    },
    generate: {
      get: () => generate
    },
    get: {
      get: () => {
        return (deps) => {
          //console.log(`DIValue['${name}'].get()`);
          if (!generated) value = generate(deps);
          return value;
        };
      }
    },
    reload: {
      get: () => ((deps) => {
        value = generate(deps);
        return value;
      })
    },
    value: {
      get: () => value
    }
  });
}

function DIField(module, name, parent, bind = false) {
  DIValue.call(this, module, `${parent}.${name}`, p => {
    if(bind)
      return p[name].bind(p);
    else
      return p[name];
  }, [parent]);
}

/* web-end */

module.exports = {
  DIValue,
  DIField
};
