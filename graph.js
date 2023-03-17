const {
  ArrayLib
} = require('./array.js');

/* web-start */

class Poset {
  #nodes = {};
  related(src, dst, direct = false) {
    let node = this.#nodes[src];
    if (!node) return false;
    if (!this.#nodes[dst]) return false;
    if(node.out[dst] == 1) return true;
    if(direct) return false;
    let relations = {
        [src]: 1
      },
      queue = [src];
    while (queue.length > 0) {
      let key = queue.splice(0, 1)[0];
      node = this.#nodes[key];
      if (key == dst) return true;
      Object.keys(node.out).forEach(n => {
        if (!relations[n]) queue.push(n);
        relations[n] = 1;
      });
    }
    return false;
  }
  descendants(name, direct = false) {
    if(name instanceof Array) {
      let sort = ArrayLib.operatorSort;
      let names = ArrayLib.dedupe(name, sort);
      let ancestors = names.reduce((a,c) => {
        return ArrayLib.union(a, this.ancestors(c, false), sort);
      }, names);
      let descendants = names.reduce((a,c) => {
        return ArrayLib.union(a, this.descendants(c, false), sort);
      }, []);
      return ArrayLib.subtract(descendants, ancestors, sort);
    }
    let node = this.#nodes[name];
    if (!node) return [];
    let decendants = {
        [name]: 1
      },
      queue = [node],
      arr = [];
    if(direct) {
      Object.keys(node.out).forEach(n => {
        arr.push(n);
      });
      return arr;
    }
    while (queue.length > 0) {
      node = queue.splice(0, 1)[0];
      Object.keys(node.out).forEach(n => {
        if (!decendants[n]) {
          queue.push(this.#nodes[n]);
          arr.push(n);
        }
        decendants[n] = 1;
      });
    }
    return arr;
  }
  xdescendants(names) {
    let sort = ArrayLib.operatorSort;
    let as = this.ancestors(names);
    let ds = this.descendants(names);
    return ds.filter(c => {
      let o1 = ArrayLib.subtract(this.ancestors(c), names, sort);
      let o2 = ArrayLib.subtract(o1, ds, sort);
      // TODO: make sure c is depended on ancestors of names only through names
      let o3 = ArrayLib.subtract(o2, as, sort);
      return o3.length == 0;
    });
  }
  ancestors(name, direct = false) {
    if(name instanceof Array) {
      let sort = ArrayLib.operatorSort;
      let names = ArrayLib.dedupe(name, sort);
      let descendants = names.reduce((a,c) => {
        return ArrayLib.union(a, this.descendants(c, false), sort);
      }, names);
      let ancestors = names.reduce((a,c) => {
        return ArrayLib.union(a, this.ancestors(c, false), sort);
      }, []);
      return ArrayLib.subtract(ancestors, descendants, sort);
    }
    let node = this.#nodes[name];
    if (!node) return [];
    let ancestors = {
        [name]: 1
      },
      queue = [node],
      arr = [];
    if(direct) {
      Object.keys(node.in).forEach(n => {
        arr.push(n);
      });
      return arr;
    }
    while (queue.length > 0) {
      node = queue.splice(0, 1)[0];
      Object.keys(node.in).forEach(n => {
        if (!ancestors[n]) {
          queue.push(this.#nodes[n]);
          arr.push(n);
        }
        ancestors[n] = 1;
      });
    }
    return arr;
  }
  xancestors(names) {
    let sort = ArrayLib.operatorSort;
    let as = this.ancestors(names);
    let ds = this.descendants(names);
    return as.filter(c => {
      let o1 = ArrayLib.subtract(this.descendants(c), names, sort);
      let o2 = ArrayLib.subtract(o1, as, sort);
      // TODO: make sure c depends on descendants of names only through names
      let o3 = ArrayLib.subtract(o2, ds, sort);
      return o3.length == 0;
    });
  }
  addRelation(src, dst) {
    if (this.related(dst, src)) throw new Error('cyclic dependency');
    let Src = this.#nodes[src];
    if (!Src) Src = this.#nodes[src] = {
      out: {},
      in: {}
    };
    let Dst = this.#nodes[dst];
    if (!Dst) Dst = this.#nodes[dst] = {
      out: {},
      in: {}
    };
    Src.out[dst] = 1;
    Dst.in[src] = 1;
  }
  removeRelation(src, dst) {
    let Src = this.#nodes[src];
    if (!Src) return;
    let Dst = this.#nodes[dst];
    if (!Dst) return;
    delete Src.out[dst];
    delete Dst.in[src];
  }
  roots() {
    let out = [];
    for(const [name, Node] of Object.entries(this.#nodes)) {
      if(Object.keys(Node.in).length == 0) out.push(name);
    }
    return out;
  }
  leaves() {
    let out = [];
    for(const [name, Node] of Object.entries(this.#nodes)) {
      if(Object.keys(Node.out).length == 0) out.push(name);
    }
    return out;
  }
  interior(src, dst) {
    if(this.related(dst, src)) return this.interior(dst, src);
    if(!this.related(src, dst)) return [];
    let as = this.ancestors(dst);
    let ds = this.descendants(src);
    return ArrayLib.intersection([src].concat(ds), [dst].concat(as), ArrayLib.operatorSort);
  }
  exterior(names) {
    let sort = ArrayLib.operatorSort;
    let ancestors = names.reduce((a,c) => {
      return ArrayLib.union(a, this.ancestors(c, false), sort);
    }, names);
    let descendants = names.reduce((a,c) => {
      return ArrayLib.union(a, this.descendants(c, false), sort);
    }, names);
    let sub = ArrayLib.union(ancestors, descendants, sort);
    return ArrayLib.subtract(Object.keys(this.#nodes), sub, sort);
  }
}

/* web-end */

module.exports = {
  Poset
};