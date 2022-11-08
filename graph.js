

/* web-start */

function Poset() {
  var nodes = {};

  function related(src, dst, direct = false) {
    var node = nodes[src];
    if (!node) return false;
    if (!nodes[dst]) return false;
    if(node.out[dst] == 1) return true;
    if(direct) return false;
    var relations = {
        [src]: 1
      },
      queue = [src];
    while (queue.length > 0) {
      var key = queue.splice(0, 1)[0];
      node = nodes[key];
      if (key == dst) return true;
      Object.keys(node.out).forEach(n => {
        if (!relations[n]) queue.push(n);
        relations[n] = 1;
      });
    }
    return false;
  }

  function decendants(name, direct = false) {
    var node = nodes[name];
    if (!node) return [];
    var decendants = {
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
          queue.push(nodes[n]);
          arr.push(n);
        }
        decendants[n] = 1;
      });
    }
    return arr;
  }

  function ancestors(name, direct = false) {
    var node = nodes[name];
    if (!node) return [];
    var ancestors = {
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
          queue.push(nodes[n]);
          arr.push(n);
        }
        ancestors[n] = 1;
      });
    }
    return arr;
  }

  function addRelation(src, dst) {
    if (related(dst, src)) throw new Error('cyclic dependency');
    var Src = nodes[src];
    if (!Src) Src = nodes[src] = {
      out: {},
      in: {}
    };
    var Dst = nodes[dst];
    if (!Dst) Dst = nodes[dst] = {
      out: {},
      in: {}
    };
    Src.out[dst] = 1;
    Dst.in[src] = 1;
  }
  
  function roots() {
    let out = [];
    for(const [name, Node] of Object.entries(nodes)) {
      if(Object.keys(Node.in).length == 0) out.push(name);
    }
    return out;
  }
  
  function leaves() {
    let out = [];
    for(const [name, Node] of Object.entries(nodes)) {
      if(Object.keys(Node.out).length == 0) out.push(name);
    }
    return out;
  }

  function removeRelation(src, dst) {
    var Src = nodes[src];
    if (!Src) return;
    var Dst = nodes[dst];
    if (!Dst) return;
    delete Src.out[dst];
    delete Dst.in[src];
  }

  Object.defineProperties(this, {
    related: { get: () => related },
    decendants: { get: () => decendants },
    ancestors: { get: () => ancestors },
    addRelation: { get: () => addRelation },
    removeRelation: { get: () => removeRelation },
    roots: { get: () => roots },
    leaves: { get: () => leaves },
    //nodes: { get: () => nodes },
  });
}

/* web-end */

module.exports = {
  Poset
};