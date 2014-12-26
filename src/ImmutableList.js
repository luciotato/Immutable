// We use conses at the very end of the list for very fast O(1) push
var Cons = require("./Cons");
var avl  = require("./AVL");


// It's faster to use arrays for small lists
var array_limit = 125;

var ceiling = Math.ceil;

function array_insert_at(array, index, value) {
  var len = array.length + 1;

  var out = new Array(len);

  var i = 0;
  while (i < index) {
    out[i] = array[i];
    ++i;
  }

  out[i] = value;
  ++i;

  while (i < len) {
    out[i] = array[i - 1];
    ++i;
  }

  return out;
}

function array_modify_at(array, index, f) {
  var old_value = array[index];
  var new_value = f(old_value);

  if (old_value === new_value) {
    return array;

  } else {
    // It's fast enough to just use `array.slice`, rather than a custom function
    var new_array = array.slice();
    new_array[index] = new_value;
    return new_array;
  }
}

function array_remove_at(array, index) {
  var len = array.length - 1;

  var out = new Array(len);

  var i = 0;
  while (i < index) {
    out[i] = array[i];
    ++i;
  }

  while (i < len) {
    out[i] = array[i + 1];
    ++i;
  }

  return out;
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
  this.depth = avl.max(left.depth, right.depth) + 1;
}

ArrayNode.prototype.copy = function (left, right) {
  return new ArrayNode(left, right, this.array);
};

ArrayNode.prototype.forEach = function (f) {
  this.left.forEach(f);
  this.array.forEach(function (x) {
    f(x);
  });
  this.right.forEach(f);
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
      return avl.balanced_node(node, child, right);

    } else {
      index -= l_index;

      var array = node.array;
      var len   = array.length;
      // TODO test this
      if (index <= len) {
        array = array_insert_at(array, index, value);

        // TODO this fails when array_limit is 1
        if (len === array_limit) {
          var pivot  = ceiling(array.length / 2);
          var aleft  = array.slice(0, pivot);
          var aright = array.slice(pivot);

          if (left.depth < right.depth) {
            return new ArrayNode(avl.insert_max(left, new ArrayNode(nil, nil, aleft)), right, aright);
          } else {
            return new ArrayNode(left, avl.insert_min(right, new ArrayNode(nil, nil, aright)), aleft);
          }

        } else {
          return new ArrayNode(left, right, array);
        }

      } else {
        var child = nth_insert(right, index - len, value);
        return avl.balanced_node(node, left, child);
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
      var new_array = array_modify_at(array, index, f);
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
    return avl.balanced_node(node, child, right);

  } else {
    index -= l_index;

    var array = node.array;
    var len   = array.length;
    // TODO test this
    if (index < len) {
      // TODO use `array.length === 1` so we can skip the call to `array_remove_at`
      array = array_remove_at(array, index);

      if (array.length === 0) {
        return avl.concat(left, right);
      } else {
        return new ArrayNode(left, right, array);
      }

    } else {
      var child = nth_remove(right, index - len);
      return avl.balanced_node(node, left, child);
    }
  }
}


function ImmutableList(root, tail, tail_size) {
  this.root = root;
  this.tail = tail;
  this.tail_size = tail_size;
}

// TODO is this a good idea ?
ImmutableList.prototype = Object.create(null);

ImmutableList.prototype.forEach = function (f) {
  this.root.forEach(f);
  this.tail.forEachRev(f);
};

ImmutableList.prototype.isEmpty = function () {
  return this.root === avl.nil && this.tail === avl.nil;
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
      var node = avl.insert_max(root, new ArrayNode(nil, nil, stack_to_array(tail, tail_size)));
      return new ImmutableList(node, new Cons(value, nil), 1);

    } else {
      return new ImmutableList(root, new Cons(value, tail), tail_size + 1);
    }

  } else if (nth_has(index, len)) {
    var size = root.size;
    if (index < size) {
      return new ImmutableList(nth_insert(root, index, value), tail, tail_size);

    } else {
      var array = array_insert_at(stack_to_array(tail, tail_size), index - size, value);
      var node  = avl.insert_max(root, new ArrayNode(nil, nil, array));
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
      var array = array_remove_at(stack_to_array(tail, tail_size), index - size);
      var node  = avl.insert_max(root, new ArrayNode(nil, nil, array));
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
      var array = array_modify_at(stack, index - size, f);
      if (array === stack) {
        return this;
      } else {
        var node = avl.insert_max(root, new ArrayNode(nil, nil, array));
        return new ImmutableList(node, nil, 0);
      }
    }

  } else {
    throw new Error("Index " + index + " is not valid");
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
        lroot = avl.insert_max(lroot, new ArrayNode(nil, nil, stack_to_array(ltail, this.tail_size)));
      }

      var node = avl.concat(lroot, rroot);
      return new ImmutableList(node, rtail, right.tail_size);
    }

  } else {
    var self = this;

    // TODO use iterator
    right.forEach(function (x) {
      self = self.insert(x);
    });

    return self;
  }
};

module.exports = ImmutableList;