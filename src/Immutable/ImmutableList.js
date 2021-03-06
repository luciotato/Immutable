import { insert as array_insert, modify as array_modify, remove as array_remove } from "./Array";
import { max, balanced_node, concat, insert_min, insert_max, iter_tree } from "./AVL";
import { hash_array } from "./hash";
import { toJSON_array, fromJSON_array } from "./toJSON";
import { toJS_array } from "./toJS";
import { ImmutableBase } from "./Base";
import { toIterator, mapcat_iter, concat_iter, reverse_iter, foldl } from "./iter";
import { nil, tag_hash, tag_toJSON, fromJSON_registry, tag_toJS, tag_iter } from "./static";
import { nth_has, ordered_has } from "./Ordered";

// We use conses at the very end of the list for very fast O(1) push
import { Cons, iter_cons } from "./Cons";


// It's faster to use arrays for small lists
export var array_limit = 125;

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
            // TODO unit test for this
            // TODO insert_array_max ?
            return new ArrayNode(insert_max(left, new ArrayNode(nil, nil, aleft)), right, aright);
          } else {
            // TODO unit test for this
            // TODO insert_array_min ?
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

function insert_array_max(node, new_array) {
  if (node === nil) {
    return new ArrayNode(nil, nil, new_array);
  } else {
    var left  = node.left;
    var right = node.right;
    var array = node.array;
    if (right === nil && array.length + new_array.length <= array_limit) {
      return new ArrayNode(left, right, array.concat(new_array));
    } else {
      // TODO do we need to use balanced_node ?
      return balanced_node(node, left, insert_array_max(right, new_array));
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

ImmutableList.prototype[tag_hash] = hash_array("List");
ImmutableList.prototype[tag_toJS] = toJS_array;
ImmutableList.prototype.has = ordered_has;

fromJSON_registry["List"] = function (x) {
  return List(fromJSON_array(x));
};

ImmutableList.prototype[tag_toJSON] = function (x) {
  return toJSON_array("List", x);
};

ImmutableList.prototype[tag_iter] = function () {
  var tree = mapcat_iter(iter_tree(this.root), function (node) {
    return toIterator(node.array);
  });
  return concat_iter(tree, reverse_iter(iter_cons(this.tail)));
};

ImmutableList.prototype.isEmpty = function () {
  return this.root === nil && this.tail === nil;
};

ImmutableList.prototype.removeAll = function () {
  return new ImmutableList(nil, nil, 0);
};

ImmutableList.prototype.size = function () {
  return this.root.size + this.tail_size;
};

ImmutableList.prototype.get = function (index1, def) {
  var len = this.size();

  var index2 = (index1 < 0
                 ? index1 + len
                 : index1);

  if (nth_has(index2, len)) {
    var root = this.root;
    var size = root.size;
    if (index2 < size) {
      return nth_get(root, index2);
    } else {
      return stack_nth(this.tail, this.tail_size, index2 - size);
    }

  } else if (arguments.length === 2) {
    return def;

  } else {
    throw new Error("Index " + index2 + " is not valid");
  }
};

ImmutableList.prototype.insert = function (index1, value) {
  var arg_len = arguments.length;

  if (arg_len !== 2) {
    throw new Error("Expected 2 arguments but got " + arg_len);
  }

  var len = this.size();

  var index2 = (index1 < 0
                 ? index1 + (len + 1)
                 : index1);

  if (index2 === len) {
    return this.push(value);

  } else {
    var root      = this.root;
    var tail      = this.tail;
    var tail_size = this.tail_size;

    if (nth_has(index2, len)) {
      var size = root.size;
      if (index2 <= size) {
        return new ImmutableList(nth_insert(root, index2, value), tail, tail_size);

      } else {
        var array = array_insert(stack_to_array(tail, tail_size), index2 - size, value);
        return new ImmutableList(insert_array_max(root, array), nil, 0);
      }

    } else {
      throw new Error("Index " + index2 + " is not valid");
    }
  }
};

ImmutableList.prototype.push = function (value) {
  var root      = this.root;
  var tail      = this.tail;
  var tail_size = this.tail_size;

  if (tail_size === array_limit) {
    var node = insert_array_max(root, stack_to_array(tail, tail_size));
    return new ImmutableList(node, new Cons(value, nil), 1);
  } else {
    return new ImmutableList(root, new Cons(value, tail), tail_size + 1);
  }
};

ImmutableList.prototype.remove = function (index1) {
  var arg_len = arguments.length;

  if (arg_len !== 1) {
    throw new Error("Expected 1 argument but got " + arg_len);
  }

  var len = this.size();

  var index2 = (index1 < 0
                 ? index1 + len
                 : index1);

  var root      = this.root;
  var tail      = this.tail;
  var tail_size = this.tail_size;

  if (tail !== nil && index2 === len - 1) {
    return new ImmutableList(root, tail.cdr, tail_size - 1);

  } else if (nth_has(index2, len)) {
    var size = root.size;
    if (index2 < size) {
      return new ImmutableList(nth_remove(root, index2), tail, tail_size);

    } else {
      var array = array_remove(stack_to_array(tail, tail_size), index2 - size);
      return new ImmutableList(insert_array_max(root, array), nil, 0);
    }

  } else {
    throw new Error("Index " + index2 + " is not valid");
  }
};

ImmutableList.prototype.modify = function (index1, f) {
  var len = this.size();

  var index2 = (index1 < 0
                 ? index1 + len
                 : index1);

  if (nth_has(index2, len)) {
    var root = this.root;
    var tail = this.tail;
    var tail_size = this.tail_size;
    var size = root.size;

    if (tail !== nil && index2 === len - 1) {
      var value = f(tail.car);
      if (value === tail.car) {
        return this;
      } else {
        return new ImmutableList(root, new Cons(value, tail.cdr), tail_size);
      }

    } else if (index2 < size) {
      var node = nth_modify(root, index2, f);
      if (node === root) {
        return this;
      } else {
        return new ImmutableList(node, tail, tail_size);
      }

    } else {
      var stack = stack_to_array(tail, tail_size);
      var array = array_modify(stack, index2 - size, f);
      if (array === stack) {
        return this;
      } else {
        return new ImmutableList(insert_array_max(root, array), nil, 0);
      }
    }

  } else {
    throw new Error("Index " + index2 + " is not valid");
  }
};

// TODO a bit of code duplication
ImmutableList.prototype.set = function (index, value) {
  return this.modify(index, function () {
    return value;
  });
};

ImmutableList.prototype.slice = function (from1, to1) {
  var len = this.size();

  var arg_len = arguments.length;

  var from2 = (arg_len < 1
                ? 0
                : from1);

  var to2 = (arg_len < 2
              ? len
              : to1);

  if (typeof from2 !== "number") {
    throw new Error("Expected a number but got " + from2);
  }

  if (typeof to2 !== "number") {
    throw new Error("Expected a number but got " + to2);
  }

  var from3 = (from2 < 0
                ? from2 + len
                : from2);

  var to3 = (to2 < 0
              ? to2 + len
              : to2);

  if (from3 === 0 && to3 === len) {
    return this;

  } else if (from3 > to3) {
    throw new Error("Index " + from3 + " is greater than index " + to3);

  } else if (nth_has(from3, len)) {
    if (from3 === to3) {
      return new ImmutableList(nil, nil, 0);

    // TODO code duplication with nth_has ?
    } else if (to3 > 0 && to3 <= len) {
      var root = this.root;
      var size = root.size;

      var slices = [];

      if (from3 <= size) {
        nth_slice(slices, root, from3, to3);
      }

      if (to3 > size) {
        var stack = stack_to_array(this.tail, this.tail_size);
        add_slice(slices, array_slice(stack, from3 - size, to3 - size));
      }

      return new ImmutableList(slices_to_tree(slices), nil, 0);

    } else {
      throw new Error("Index " + to3 + " is not valid");
    }

  } else {
    throw new Error("Index " + from3 + " is not valid");
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
        lroot = insert_array_max(lroot, stack_to_array(ltail, this.tail_size));
      }

      var node = concat(lroot, rroot);
      return new ImmutableList(node, rtail, right.tail_size);
    }

  } else {
    return foldl(right, this, function (self, x) {
      return self.push(x);
    });
  }
};


export function isList(x) {
  return x instanceof ImmutableList;
}

export function List(array) {
  if (arguments.length === 0) {
    return new ImmutableList(nil, nil, 0);
  } else {
    if (array instanceof ImmutableList) {
      return array;
    } else {
      return new ImmutableList(nil, nil, 0).concat(array);
    }
  }
}
