/* web-start */

class Comparator {
  static #operatorComparator = function(a, b) {
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
  };
  static #differenceComparator = function(a, b) {
    return a - b;
  };
  static get operatorComparator() {
    return Comparator.#operatorComparator;
  }
  static get differenceComparator() {
    return Comparator.#differenceComparator;
  }
  
  static #comparators = {
    difference: this.differenceComparator,
    operator: this.#operatorComparator
  };
  static #negations = {};
  //static {
  //  this.#comparators.difference = this.differenceComparator;
  //  this.#comparators.operator = this.#operatorComparator;
  //}
  static RegisterComparator(name, func) {
    if(Comparator.#comparators[name]) return;
    Comparator.#comparators[name] = func;
  }
  static Compare(comparator, a, b) {
    comparator = Comparator.#comparators[comparator];
    if(!comparator) comparator = Comparator.#comparators.operator;
    return comparator(a, b);
  }
  static get Operator() { return new Comparator("operator"); }
  static get Difference() { return new Comparator("difference"); }
  
  #name;
  #func;
  #neg;
  constructor(name) {
    this.#name = name;
    this.#func = Comparator.#comparators[name];
    this.#neg = Comparator.#negations[name];
    if(!this.#neg) {
      let nname = this.#neg = name + 'Neg';
      Comparator.#negations[name] = nname;
      Comparator.#negations[nname] = name;
      let func = this.#func;
      let nfunc = (a, b) => -func(a, b);
      Comparator.RegisterComparator(nname, nfunc);
    }
  }
  get name() { return this.#name; }
  negation() { return new Comparator(this.#neg); }
  compare(a, b) { return this.#func(a, b); }
  sort(arr) {
    arr.sort((a, b) => this.compare(a, b));
    return arr;
  }
  isSorted(arr) {
    return arr.every((c,i) => i == 0 || this.compare(c, arr[i - 1]) >= 0);
  }
}

class ArrayLib {
  static clone(a) {
    return a.map(v => v);
  }
  static sort(a, comp) {
    return comp.sort(a);
  }
  static isSorted(a, comp) {
    return comp.isSorted(a);
  }
  static binarySearch(a, e, comp, i = 0, j = a.length - 1) {
    let k, c;
    c = comp.compare(a[i], e);
    if (c >= 0) return i;
    c = comp.compare(a[j], e);
    if (c == 0) return j;
    if (c < 0) return j + 1;
    while (i < j) {
      k = Math.floor((i + j) / 2);
      c = comp.compare(a[k], e);
      if (c == 0) return k;
      else if (c < 0) {
        i = k + 1;
        c = comp.compare(a[i], e);
        if (c >= 0) return i;
      }
      else if (c > 0) {
        j = k - 1;
        c = comp.compare(a[j], e);
        if (c == 0) return j;
        if (c < 0) return j + 1;
      }
    }
  }
  static sorted(a, comp) {
    let o = a.map(v => v);
    return ArrayLib.sort(o, comp);
  }
  static dedupe(a, comp) {
    let o = ArrayLib.sorted(a, comp);
    return o.filter((c,i) => i == 0 || comp.compare(c, o[i-1]) != 0);
  }
  static union(a, b, comp) {
    let o = a.concat(b);
    return ArrayLib.dedupe(o, comp);
  }
  static intersection(a, b, comp) {
    a = ArrayLib.dedupe(a, comp);
    b = ArrayLib.dedupe(b, comp);
    let o = [];
    let i = 0, j = 0;
    while(i < a.length && j < b.length) {
      let s = comp.compare(a[i], b[j]);
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
  static subtract(a, b, comp) {
    a = ArrayLib.sorted(a, comp);
    b = ArrayLib.dedupe(b, comp);
    let o = [];
    let i = 0, j = 0;
    while(i < a.length && j < b.length) {
      let s = comp.compare(a[i], b[j]);
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

class SortedArray {
  #array;
  #comparator;
  constructor() {
    switch(arguments.length) {
      case 0:
        this.#array = [];
        this.#comparator = Comparator.Operator;
        break;
      case 1:
        if(arguments[0] instanceof Comparator) {
          this.#array = [];
          this.#comparator = arguments[0];
        }
        else {
          this.#array = arguments[0];
          this.#comparator = Comparator.Operator;
          this.#comparator.sort(this.#array);
        }
        break;
      case 2:
        this.#array = arguments[0];
        this.#comparator = arguments[1];
        this.#comparator.sort(this.#array);
        break;
      default:
        throw new Error();
    }
  }
  get array() { return this.#array; }
  get comparator() { return this.#comparator; }
  get length() { return this.#array.length; }
  binarySearch(e, i, j) {
    return ArrayLib.binarySearch(this.#array, e, this.#comparator, i, j);
  }
  #insert(e) {
    const array = this.#array;
    if (true) {
      let i = this.binarySearch(e);
      array.splice(i, 0, e);
    }
    else {
      array.push(e);
      array.sort(this.#comparator);
    }
  }
  at(i) { return this.#array.at(i); }
  indexOf(searchElement, fromIndex) { return this.#array.indexOf(searchElement, fromIndex); }
  lastIndexOf(searchElement, fromIndex) { return this.#array.lastIndexOf(searchElement, fromIndex); }
  push(e) {
    const array = this.#array;
    const comparator = this.#comparator;
    if (array.length == 0) {
      array.push(e);
      return;
    }
    const last = array[array.length - 1];
    if (comparator.compare(last, e) <= 0) {
      array.push(e);
      return;
    }
    this.#insert(e);
  }
  reverse() {
    return this.sort(this.#comparator.negation());
  }
  sort(comp) {
    return new SortedArray(ArrayLib.clone(this.#array), comp);
  }
}

/* web-end */

module.exports = {
  Comparator,
  ArrayLib,
  SortedArray
};