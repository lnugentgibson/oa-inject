/* web-start */

function DIValue(module, name, generator, dependencies) {
  if(name.includes(':')) throw new Error("name cannot contain ':'");
  
  var value;
  var generated = false;

  function generate() {
    //console.log(`DIValue['${name}'].generate()`);
    //console.log(`DIValue['${name}'].generator`);
    //console.log(generator);
    try {
    if (dependencies)
      value = generator.apply(null, dependencies.map(dep => {
        //console.log(`${name} requires ${dep}`);
        return module.get(dep);
      }));
    else
      value = generator.call(null);
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
  }

  Object.defineProperties(this, {
    name: {
      get: () => name
    },
    dependencies: {
      get: () => dependencies.map(n => n)
    },
    generated: {
      get: () => generated
    },
    generate: {
      get: () => generate
    },
    get: {
      get: () => {
        return () => {
          //console.log(`DIValue['${name}'].get()`);
          if (!generated) generate();
          return value;
        };
      }
    },
    reload: {
      get: () => (() => {
        generate();
        return value;
      })
    },
    value: {
      get: () => value
    }
  });
}

function DIField(module, name, parent) {
  DIValue.call(this, module, `${parent}.${name}`, p => p[name], [parent]);
}

/* web-end */

module.exports = {
  DIValue,
  DIField
};
