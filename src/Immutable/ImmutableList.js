import { insert as array_insert, modify as array_modify, remove as array_remove } from "./Array";
import { max, balanced_node, concat, insert_min, insert_max, iter_tree } from "./AVL";
import { tag_hash, hash, join_lines } from "./hash";
import { toJSON_array, fromJSON_array, tag_toJSON, fromJSON_registry } from "./toJSON";
import { toJS_array, tag_toJS } from "./toJS";
import { ImmutableBase } from "./Base";
import { tag_iter, iter, mapcat_iter, concat_iter, reverse_iter, map, foldl } from "./iter";
import { nil } from "./nil";

// We use conses at the very end of the list for very fast O(1) push
import { Cons, iter_cons } from "./Cons";


// It's faster to use arrays for small lists
var array_limit = 125;

var ceiling = Math.ceil;
var floor   = Math.floor;


function add_slice(slices, slice) {
  if (slices.length) {
    var last = slices[slices.length - 1];
    if (last.length + slice.length <= array_limit) {
      slices[slices.length - 1] = last.concat(slice);
    } else {
      slices.push(slice);
    }
  } else {
    slices.push(slice);
  }
}

function slices_to_tree1(slices, min, max) {
  if (min < max) {
    var pivot = floor((min + max) / 2);
    var left  = slices_to_tree1(slices, min, pivot);
    var right = slices_to_tree1(slices, pivot + 1, max);
    return new ArrayNode(left, right, slices[pivot]);
  } else {
    return nil;
  }
}

function slices_to_tree(slices) {
  return slices_to_tree1(slices, 0, slices.length);
}

// TODO move this into Array.js ?
function array_slice(array, from, to) {
  if (from < 0) {
    from = 0;
  }

  var len = array.length;
  if (to > len) {
    to = len;
  }

  if (from === 0 && to === len) {
    return array;
  } else {
    return array.slice(from, to);
  }
}


// Converts a stack (reversed cons) into an array
function stack_to_array(a, size) {
  var out = new Array(size);

  while (size--) {
    out[size] = a.car;
    a = a.cdr;
  }

  return out;
}

function stack_nth(a, size, i) {
  while (--size !== i) {
    a = a.cdr;
  }

  return a.car;
}


function ArrayNode(left, right, array) {
  this.left  = left;
  this.right = right;
  this.array = array;
  this.size  = left.size + right.size + array.length;
  this.depth = max(left.depth, right.depth) + 1;
}

ArrayNode.prototype.copy = function (left, right) {
  return new ArrayNode(left, right, this.array);
};


function nth_has(index, len) {
  return index >= 0 && index < len;
}

function nth_get(node, index) {
  for (;;) {
    var left    = node.left;
    var l_index = left.size;

    if (index < l_index) {
      node = left;

    } else {
      index -= l_index;

      var array = node.array;
      var len   = array.length;
      if (index < len) {
        return array[index];

      } else {
        index -= len;
        node  = node.right;
      }
    }
  }
}

function nth_insert(node, index, value) {
  // TODO is this necessary ?
  if (node === nil) {
    return new ArrayNode(nil, nil, [value]);

  } else {
    var left    = node.left;
    var right   = node.right;
    var l_index = left.size;

    if (index < l_index) {
      var child = nth_insert(left, index, value);
      return balanced_node(node, child, right);

    } else {
      index -= l_index;

      var array = node.array;
      var len   = array.length;
      // TODO test this
      if (index <= len) {
        array = array_insert(array, index, value);

        // TODO this fails when array_limit is 1
        if (len === array_limit) {
          var pivot  = ceiling(array.length / 2);
          var aleft  = array.slice(0, pivot);
          var aright = array.slice(pivot);

          if (left.depth < right.depth) {
            return new ArrayNode(insert_max(left, new ArrayNode(nil, nil, aleft)), right, aright);
          } else {
            return new ArrayNode(left, insert_min(right, new ArrayNode(nil, nil, aright)), aleft);
          }

        } else {
          return new ArrayNode(left, right, array);
        }

      } else {
        var child = nth_insert(right, index - len, value);
        return balanced_node(node, left, child);
      }
    }
  }
}

function nth_modify(node, index, f) {
  var left    = node.left;
  var right   = node.right;
  var l_index = left.size;

  if (index < l_index) {
    var child = nth_modify(left, index, f);
    if (child === left) {
      return node;
    } else {
      return node.copy(child, right); // TODO test this
    }

  } else {
    index -= l_index;

    var array = node.array;
    var len   = array.length;
    // TODO test this
    if (index < len) {
      var new_array = array_modify(array, index, f);
      if (new_array === array) {
        return node;
      } else {
        return new ArrayNode(left, right, new_array);
      }

    } else {
      var child = nth_modify(right, index - len, f);
      if (child === right) {
        return node;
      } else {
        return node.copy(left, child); // TODO test this
      }
    }
  }
}

function nth_remove(node, index) {
  var left    = node.left;
  var right   = node.right;
  var l_index = left.size;

  if (index < l_index) {
    var child = nth_remove(left, index);
    return balanced_node(node, child, right);

  } else {
    index -= l_index;

    var array = node.array;
    var len   = array.length;
    // TODO test this
    if (index < len) {
      // TODO use `array.length === 1` so we can skip the call to `array_remove`
      array = array_remove(array, index);

      if (array.length === 0) {
        return concat(left, right);
      } else {
        return new ArrayNode(left, right, array);
      }

    } else {
      var child = nth_remove(right, index - len);
      return balanced_node(node, left, child);
    }
  }
}

function nth_slice(slices, node, from, to) {
  if (node !== nil) {
    var left = node.left;
    var size = left.size;

    if (from < size) {
      nth_slice(slices, left, from, to);
    }

    var array = node.array;
    var len   = array.length;

    from -= size;
    to   -= size;

    if (from < len && to > 0) {
      add_slice(slices, array_slice(array, from, to));
    }

    if (to > len) {
      nth_slice(slices, node.right, from - len, to - len);
    }
  }
}


export function ImmutableList(root, tail, tail_size) {
  this.root = root;
  this.tail = tail;
  this.tail_size = tail_size;
  this.hash = null;
}

ImmutableList.prototype = Object.create(ImmutableBase);

fromJSON_registry["List"] = function (x) {
  return List(fromJSON_array(x));
};

ImmutableList.prototype[tag_toJSON] = function (x) {
  return toJSON_array("List", x);
};

ImmutableList.prototype[tag_hash] = function (x) {
  if (x.hash === null) {
    var a = map(x, function (x) {
      return hash(x);
    });

    x.hash = "(List" + join_lines(a, "  ") + ")";
  }

  return x.hash;
};

ImmutableList.prototype[tag_toJS] = toJS_array;

ImmutableList.prototype[tag_iter] = function () {
  var tree = mapcat_iter(iter_tree(this.root), function (node) {
    return iter(node.array);
  });
  return concat_iter(tree, reverse_iter(iter_cons(this.tail)));
};

ImmutableList.prototype.isEmpty = function () {
  return this.root === nil && this.tail === nil;
};

ImmutableList.prototype.size = function () {
  return this.root.size + this.tail_size;
};

ImmutableList.prototype.has = function (index) {
  var len = this.size();

  if (index < 0) {
    index += len;
  }

  return nth_has(index, len);
};

ImmutableList.prototype.get = function (index, def) {
  var len = this.size();

  if (index < 0) {
    index += len;
  }

  if (nth_has(index, len)) {
    var root = this.root;
    var size = root.size;
    if (index < size) {
      return nth_get(root, index);
    } else {
      return stack_nth(this.tail, this.tail_size, index - size);
    }

  } else if (arguments.length === 2) {
    return def;

  } else {
    throw new Error("Index " + index + " is not valid");
  }
};

ImmutableList.prototype.insert = function (value, index) {
  if (arguments.length === 1) {
    index = -1;
  }

  var len = this.size();

  if (index < 0) {
    index += (len + 1);
  }

  var root      = this.root;
  var tail      = this.tail;
  var tail_size = this.tail_size;
  if (index === len) {
    if (tail_size === array_limit) {
      var node = insert_max(root, new ArrayNode(nil, nil, stack_to_array(tail, tail_size)));
      return new ImmutableList(node, new Cons(value, nil), 1);

    } else {
      return new ImmutableList(root, new Cons(value, tail), tail_size + 1);
    }

  } else if (nth_has(index, len)) {
    var size = root.size;
    // TODO should this be <= ?
    if (index < size) {
      return new ImmutableList(nth_insert(root, index, value), tail, tail_size);

    } else {
      var array = array_insert(stack_to_array(tail, tail_size), index - size, value);
      var node  = insert_max(root, new ArrayNode(nil, nil, array));
      return new ImmutableList(node, nil, 0);
    }

  } else {
    throw new Error("Index " + index + " is not valid");
  }
};

ImmutableList.prototype.remove = function (index) {
  if (arguments.length === 0) {
    index = -1;
  }

  var len = this.size();

  if (index < 0) {
    index += len;
  }

  var root      = this.root;
  var tail      = this.tail;
  var tail_size = this.tail_size;

  if (tail !== nil && index === len - 1) {
    return new ImmutableList(root, tail.cdr, tail_size - 1);

  } else if (nth_has(index, len)) {
    var size = root.size;
    if (index < size) {
      return new ImmutableList(nth_remove(root, index), tail, tail_size);

    } else {
      var array = array_remove(stack_to_array(tail, tail_size), index - size);
      var node  = insert_max(root, new ArrayNode(nil, nil, array));
      return new ImmutableList(node, nil, 0);
    }

  } else {
    throw new Error("Index " + index + " is not valid");
  }
};

ImmutableList.prototype.modify = function (index, f) {
  var len = this.size();

  if (index < 0) {
    index += len;
  }

  if (nth_has(index, len)) {
    var root = this.root;
    var tail = this.tail;
    var tail_size = this.tail_size;
    var size = root.size;

    if (tail !== nil && index === len - 1) {
      var value = f(tail.car);
      if (value === tail.car) {
        return this;
      } else {
        return new ImmutableList(root, new Cons(value, tail.cdr), tail_size);
      }

    } else if (index < size) {
      var node = nth_modify(root, index, f);
      if (node === root) {
        return this;
      } else {
        return new ImmutableList(node, tail, tail_size);
      }

    } else {
      var stack = stack_to_array(tail, tail_size);
      var array = array_modify(stack, index - size, f);
      if (array === stack) {
        return this;
      } else {
        var node = insert_max(root, new ArrayNode(nil, nil, array));
        return new ImmutableList(node, nil, 0);
      }
    }

  } else {
    throw new Error("Index " + index + " is not valid");
  }
};

ImmutableList.prototype.slice = function (from, to) {
  var len = this.size();

  if (from == null) {
    from = 0;
  }
  if (to == null) {
    to = len;
  }

  if (from < 0) {
    from += len;
  }
  if (to < 0) {
    to += len;
  }

  if (from === 0 && to === len) {
    return this;

  } else if (from > to) {
    throw new Error("Index " + from + " is greater than index " + to);

  } else if (nth_has(from, len)) {
    if (from === to) {
      return new ImmutableList(nil, nil, 0);

    // TODO code duplication with nth_has ?
    } else if (to > 0 && to <= len) {
      var root = this.root;
      var size = root.size;

      var slices = [];

      if (from <= size) {
        nth_slice(slices, root, from, to);
      }

      if (to > size) {
        var stack = stack_to_array(this.tail, this.tail_size);
        add_slice(slices, array_slice(stack, from - size, to - size));
      }

      return new ImmutableList(slices_to_tree(slices), nil, 0);

    } else {
      throw new Error("Index " + to + " is not valid");
    }

  } else {
    throw new Error("Index " + from + " is not valid");
  }
};

ImmutableList.prototype.concat = function (right) {
  if (right instanceof ImmutableList) {
    var lroot = this.root;
    var ltail = this.tail;

    var rroot = right.root;
    var rtail = right.tail;

    if (rroot === nil && rtail === nil) {
      return this;

    } else if (lroot === nil && ltail === nil) {
      return right;

    } else {
      if (ltail !== nil) {
        lroot = insert_max(lroot, new ArrayNode(nil, nil, stack_to_array(ltail, this.tail_size)));
      }

      var node = concat(lroot, rroot);
      return new ImmutableList(node, rtail, right.tail_size);
    }

  } else {
    return foldl(right, this, function (self, x) {
      return self.insert(x);
    });
  }
};

/*ImmutableList.prototype.push = function (value) {
  var root      = this.root;
  var tail      = this.tail;
  var tail_size = this.tail_size;

  if (tail_size === array_limit) {
    var node = insert_max(root, new ArrayNode(nil, nil, stack_to_array(tail, tail_size)));
    return new ImmutableList(node, new Cons(value, nil), 1);
  } else {
    return new ImmutableList(root, new Cons(value, tail), tail_size + 1);
  }
};*/


export function isList(x) {
  return x instanceof ImmutableList;
}

export function List(array) {
  if (array != null) {
    if (array instanceof ImmutableList) {
      return array;
    } else {
      return new ImmutableList(nil, nil, 0).concat(array);
    }
  } else {
    return new ImmutableList(nil, nil, 0);
  }
}
