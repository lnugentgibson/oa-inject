/* web-start */

class ArrayLib {
  static #operatorSort = function(a, b) {
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
  };
  static #differenceSort = function(a, b) {
    return a - b;
  };
  static get operatorSort() {
    return ArrayLib.#operatorSort;
  }
  static get differenceSort() {
    return ArrayLib.#differenceSort;
  }
  
  static clone(a) {
    return a.map(v => v);
  }
  static dedupe(a, sort) {
    let o = ArrayLib.clone(a);
    o.sort(sort);
    return o.filter((c,i) => i == 0 || sort(c, o[i-1]) != 0);
  }
  static union(a, b, sort) {
    let o = a.concat(b);
    return ArrayLib.dedupe(o, sort);
  }
  static intersection(a, b, sort) {
    a = ArrayLib.dedupe(a, sort);
    b = ArrayLib.dedupe(b, sort);
    let o = [];
    let i = 0, j = 0;
    while(i < a.length && j < b.length) {
      let s = sort(a[i], b[j]);
      if(s < 0) i++;
      else if(s > 0) j++;
      else {
        o.push(a[i]);
        i++;
        j++;
      }
    }
    return o;
  }
  static subtract(a, b, sort) {
    a = ArrayLib.clone(a);
    a.sort(sort);
    b = ArrayLib.dedupe(b, sort);
    let o = [];
    let i = 0, j = 0;
    while(i < a.length && j < b.length) {
      let s = sort(a[i], b[j]);
      if(s < 0) {
        o.push(a[i]);
        i++;
      }
      else if(s > 0) j++;
      else {
        i++;
        j++;
      }
    }
    while(i < a.length) {
      o.push(a[i]);
      i++;
    }
    return o;
  }
}

/* web-end */

module.exports = {
  ArrayLib
};