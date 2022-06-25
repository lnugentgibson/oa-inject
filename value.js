/* web-start */

function DIValue(module, name, type, generator, dependencies) {
  var value;
  var generated = false;

  function generate() {
    //console.log(`DIValue['${name}'].generate()`);
    //console.log(`DIValue['${name}'].generator`);
    //console.log(generator);
    if (dependencies)
      value = generator.apply(null, dependencies.map(dep => {
        //console.log(`${name} requires ${dep}`);
        return module.get(dep);
      }));
    else
      value = generator.call(null);
    //console.log(`DIValue['${name}'].value`);
    generated = true;
    //console.log(value);
  }

  Object.defineProperties(this, {
    name: {
      get: () => name
    },
    type: {
      get: () => type
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

/* web-end */

module.exports = {
  DIValue
};
