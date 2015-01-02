(function() {
    "use strict";
    function $$util$$isObject(x) {
      return Object(x) === x;
    }

    function $$util$$isJSLiteral(x) {
      if ($$util$$isObject(x)) {
        var proto = Object.getPrototypeOf(x);
        // TODO this won't work cross-realm
        return proto === null || proto === Object.prototype;
      } else {
        return false;
      }
    }

    function $$util$$repeat(s, i) {
      return new Array(i + 1).join(s);
    }

    function $$util$$pad_right(input, i, s) {
      var right = Math.max(0, i - input.length);
      return input + $$util$$repeat(s, right);
    }

    function $$util$$join_lines(a, spaces) {
      if (a.length) {
        var separator = "\n" + spaces;
        return separator + a.map(function (x) {
          return x.replace(/\n/g, separator);
        }).join(separator);
      } else {
        return "";
      }
    }
    var $$hash$$hash_interface = "__CFB38D33-7CD8-419E-A1B6-61D1B8AC7C83_hash__";

    var $$hash$$mutable_hash_id = 0;

    function $$hash$$hash(x) {
      var type = typeof x;
      // TODO this is probably pretty inefficient
      if (type === "string") {
        return "\"" + x.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"").replace(/\n/g, "\n ") + "\"";

      } else if (type === "number"    ||
                 type === "boolean"   ||
                 type === "undefined" ||
                 x === null) {
        return "" + x;

      } else {
        var hasher = x[$$hash$$hash_interface];
        if (hasher != null) {
          return hasher(x);

        } else {
          var id = "(Mutable " + (++$$hash$$mutable_hash_id) + ")";

          Object.defineProperty(x, $$hash$$hash_interface, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function () {
              return id;
            }
          });

          return id;
        }
      }
    }

    function $$hash$$hash_dict(x, spaces) {
      var a = [];

      var max_key = 0;

      x.forEach(function (_array) {
        var key   = $$hash$$hash(_array[0]);
        var value = $$hash$$hash(_array[1]);

        key = key.split(/\n/);

        key.forEach(function (key) {
          max_key = Math.max(max_key, key.length);
        });

        a.push({
          key: key,
          value: value
        });
      });

      var spaces = "  ";

      a = a.map(function (x) {
        var last = x.key.length - 1;
        x.key[last] = $$util$$pad_right(x.key[last], max_key, " ");

        var key = x.key.join("\n");

        var value = x.value.replace(/\n/g, "\n" + $$util$$repeat(" ", max_key + 3));

        return key + " = " + value;
      });

      return $$util$$join_lines(a, spaces);
    }
    var $$toJS$$toJS_interface = "__DEE5921D-20A6-40D0-9A74-40C5BAC8C663_toJS__";

    function $$toJS$$toJS(x) {
      if ($$util$$isObject(x)) {
        var fn = x[$$toJS$$toJS_interface];
        if (fn != null) {
          return fn(x);
        } else {
          return x;
        }
      } else {
        return x;
      }
    }

    function $$toJS$$toJS_object(x) {
      var o = {};

      x.forEach(function (_array) {
        var key   = _array[0];
        var value = _array[1];

        // TODO use isString test ?
        if (typeof key !== "string") {
          throw new Error("Cannot convert to JavaScript: expected string key but got " + key);
        }

        o[key] = $$toJS$$toJS(value);
      });

      return o;
    }

    function $$toJS$$toJS_array(x) {
      var a = [];

      x.forEach(function (value) {
        a.push($$toJS$$toJS(value));
      });

      return a;
    }
    var $$$Immutable$nil$$nil = {};
    $$$Immutable$nil$$nil.depth      = 0;
    $$$Immutable$nil$$nil.size       = 0;
    $$$Immutable$nil$$nil.forEach    = function (f) {};
    $$$Immutable$nil$$nil.forEachRev = function (f) {};
    function $$AVL$$max(x, y) {
      if (x > y) {
        return x;
      } else {
        return y;
      }
    }

    function $$AVL$$balanced_node(node, left, right) {
      var l_depth = left.depth;
      var r_depth = right.depth;

      // Left side is deeper
      if (l_depth > r_depth + 1) {
        var lleft  = left.left;
        var lright = left.right;

        // Right side is deeper
        if (lright.depth > lleft.depth) {
          // Left rotate -> Right rotate
          return lright.copy(left.copy(lleft, lright.left),
                             node.copy(lright.right, right));

        // Left side is deeper
        } else {
          // Right rotate
          return left.copy(lleft, node.copy(lright, right));
        }

      // Right side is deeper
      } else if (r_depth > l_depth + 1) {
        var rright = right.right;
        var rleft  = right.left;

        // Left side is deeper
        if (rleft.depth > rright.depth) {
          // Right rotate -> Left rotate
          return rleft.copy(node.copy(left, rleft.left),
                            right.copy(rleft.right, rright));

        // Right side is deeper
        } else {
          // Left rotate
          return right.copy(node.copy(left, rleft), rright);
        }

      // No balancing needed
      } else {
        return node.copy(left, right);
      }
    }

    function $$AVL$$concat(x, y) {
      if (x === $$$Immutable$nil$$nil) {
        return y;

      } else if (y === $$$Immutable$nil$$nil) {
        return x;

      // TODO what if the depths are the same?
      } else if (x.depth < y.depth) {
        var left = $$AVL$$concat(x, y.left);
        return $$AVL$$balanced_node(y, left, y.right);

      } else {
        var right = $$AVL$$concat(x.right, y);
        return $$AVL$$balanced_node(x, x.left, right);
      }
    }

    function $$AVL$$insert_min(node, new_node) {
      if (node === $$$Immutable$nil$$nil) {
        return new_node;
      } else {
        // TODO do we need to use balanced_node ?
        return $$AVL$$balanced_node(node, $$AVL$$insert_min(node.left, new_node), node.right);
      }
    }

    function $$AVL$$insert_max(node, new_node) {
      if (node === $$$Immutable$nil$$nil) {
        return new_node;
      } else {
        // TODO do we need to use balanced_node ?
        return $$AVL$$balanced_node(node, node.left, $$AVL$$insert_max(node.right, new_node));
      }
    }
    function $$Sorted$$simpleSort(x, y) {
      if (x === y) {
        return 0;
      } else if (x < y) {
        return -1;
      } else {
        return 1;
      }
    }

    function $$Sorted$$defaultSort(x, y) {
      x = $$hash$$hash(x);
      y = $$hash$$hash(y);
      return $$Sorted$$simpleSort(x, y);
    }

    function $$Sorted$$key_get(node, sort, key) {
      while (node !== $$$Immutable$nil$$nil) {
        var order = sort(key, node.key);
        if (order === 0) {
          break;

        } else if (order < 0) {
          node = node.left;

        } else {
          node = node.right;
        }
      }

      return node;
    }

    function $$Sorted$$key_set(node, sort, key, new_node) {
      if (node === $$$Immutable$nil$$nil) {
        return new_node;

      } else {
        var left  = node.left;
        var right = node.right;

        var order = sort(key, node.key);
        if (order === 0) {
          return node.modify(new_node);

        } else if (order < 0) {
          var child = $$Sorted$$key_set(left, sort, key, new_node);
          if (child === left) {
            return node;
          } else {
            return $$AVL$$balanced_node(node, child, right);
          }

        } else {
          var child = $$Sorted$$key_set(right, sort, key, new_node);
          if (child === right) {
            return node;
          } else {
            return $$AVL$$balanced_node(node, left, child);
          }
        }
      }
    }

    function $$Sorted$$key_modify(node, sort, key, f) {
      if (node === $$$Immutable$nil$$nil) {
        throw new Error("Key " + key + " not found");

      } else {
        var left  = node.left;
        var right = node.right;

        var order = sort(key, node.key);
        if (order === 0) {
          // TODO what if `f` suspends?
          return node.modify({ key: key, value: f(node.value) });

        } else if (order < 0) {
          var child = $$Sorted$$key_modify(left, sort, key, f);
          if (child === left) {
            return node;
          } else {
            return $$AVL$$balanced_node(node, child, right);
          }

        } else {
          var child = $$Sorted$$key_modify(right, sort, key, f);
          if (child === right) {
            return node;
          } else {
            return $$AVL$$balanced_node(node, left, child);
          }
        }
      }
    }

    function $$Sorted$$key_remove(node, sort, key) {
      if (node === $$$Immutable$nil$$nil) {
        return node;

      } else {
        var left  = node.left;
        var right = node.right;

        var order = sort(key, node.key);
        if (order === 0) {
          return $$AVL$$concat(left, right);

        } else if (order < 0) {
          var child = $$Sorted$$key_remove(left, sort, key);
          if (child === left) {
            return node;
          } else {
            return $$AVL$$balanced_node(node, child, right);
          }

        } else {
          var child = $$Sorted$$key_remove(right, sort, key);
          if (child === right) {
            return node;
          } else {
            return $$AVL$$balanced_node(node, left, child);
          }
        }
      }
    }
    var $$ImmutableBase$$ImmutableBase = {};

    $$ImmutableBase$$ImmutableBase.toString = function () {
      return $$hash$$hash(this);
    };

    $$ImmutableBase$$ImmutableBase.inspect = $$ImmutableBase$$ImmutableBase.toString;

    function $$ImmutableDict$$KeyNode(left, right, key, value) {
      this.left  = left;
      this.right = right;
      this.key   = key;
      this.value = value;
      this.depth = $$AVL$$max(left.depth, right.depth) + 1;
    }

    $$ImmutableDict$$KeyNode.prototype.copy = function (left, right) {
      return new $$ImmutableDict$$KeyNode(left, right, this.key, this.value);
    };

    $$ImmutableDict$$KeyNode.prototype.modify = function (info) {
      var key   = info.key;
      var value = info.value;
      // We don't use equal, for increased speed
      if (this.key === key && this.value === value) {
        return this;
      } else {
        return new $$ImmutableDict$$KeyNode(this.left, this.right, key, value);
      }
    };

    $$ImmutableDict$$KeyNode.prototype.forEach = function (f) {
      this.left.forEach(f);
      f([this.key, this.value]);
      this.right.forEach(f);
    };


    function $$ImmutableDict$$ImmutableDict(root, sort) {
      this.root = root;
      this.sort = sort;
      this.hash = null;
    }

    $$ImmutableDict$$ImmutableDict.prototype = Object.create($$ImmutableBase$$ImmutableBase);

    $$ImmutableDict$$ImmutableDict.prototype[$$hash$$hash_interface] = function (x) {
      if (x.hash === null) {
        // We don't use equal, for increased speed
        if (x.sort === $$Sorted$$defaultSort) {
          x.hash = "(Dict" + $$hash$$hash_dict(x, "  ") + ")";
        } else {
          x.hash = "(SortedDict " + $$hash$$hash(x.sort) + $$hash$$hash_dict(x, "  ") + ")";
        }
      }

      return x.hash;
    };

    $$ImmutableDict$$ImmutableDict.prototype[$$toJS$$toJS_interface] = $$toJS$$toJS_object;

    // TODO Symbol.iterator
    $$ImmutableDict$$ImmutableDict.prototype.forEach = function (f) {
      this.root.forEach(f);
    };

    $$ImmutableDict$$ImmutableDict.prototype.isEmpty = function () {
      return this.root === $$$Immutable$nil$$nil;
    };

    // TODO what if `sort` suspends ?
    $$ImmutableDict$$ImmutableDict.prototype.has = function (key) {
      return $$Sorted$$key_get(this.root, this.sort, key) !== $$$Immutable$nil$$nil;
    };

    // TODO what if `sort` suspends ?
    $$ImmutableDict$$ImmutableDict.prototype.get = function (key, def) {
      var node = $$Sorted$$key_get(this.root, this.sort, key);
      if (node === $$$Immutable$nil$$nil) {
        if (arguments.length === 2) {
          return def;
        } else {
          throw new Error("Key " + key + " not found");
        }
      } else {
        return node.value;
      }
    };

    // TODO code duplication
    // TODO what if `sort` suspends ?
    $$ImmutableDict$$ImmutableDict.prototype.set = function (key, value) {
      var root = this.root;
      var sort = this.sort;
      var node = $$Sorted$$key_set(root, sort, key, new $$ImmutableDict$$KeyNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, key, value));
      if (node === root) {
        return this;
      } else {
        return new $$ImmutableDict$$ImmutableDict(node, sort);
      }
    };

    // TODO code duplication
    // TODO what if `sort` suspends ?
    $$ImmutableDict$$ImmutableDict.prototype.remove = function (key) {
      var root = this.root;
      var sort = this.sort;
      var node = $$Sorted$$key_remove(root, sort, key);
      if (node === root) {
        return this;
      } else {
        return new $$ImmutableDict$$ImmutableDict(node, sort);
      }
    };

    // TODO code duplication
    // TODO what if `sort` suspends ?
    $$ImmutableDict$$ImmutableDict.prototype.modify = function (key, f) {
      var root = this.root;
      var sort = this.sort;
      var node = $$Sorted$$key_modify(root, sort, key, f);
      if (node === root) {
        return this;
      } else {
        return new $$ImmutableDict$$ImmutableDict(node, sort);
      }
    };

    // TODO code duplication with ImmutableRecord
    $$ImmutableDict$$ImmutableDict.prototype.merge = function (other) {
      var self = this;

      other.forEach(function (_array) {
        var key   = _array[0];
        var value = _array[1];

        self = self.set(key, value);
      });

      return self;
    };

    function $$ImmutableSet$$SetNode(left, right, key) {
      this.left  = left;
      this.right = right;
      this.key   = key;
      this.depth = $$AVL$$max(left.depth, right.depth) + 1;
    }

    $$ImmutableSet$$SetNode.prototype.copy = function (left, right) {
      return new $$ImmutableSet$$SetNode(left, right, this.key);
    };

    $$ImmutableSet$$SetNode.prototype.modify = function (info) {
      var key = info.key;
      // We don't use equal, for increased speed
      if (this.key === key) {
        return this;
      } else {
        return new $$ImmutableSet$$SetNode(this.left, this.right, key);
      }
    };

    $$ImmutableSet$$SetNode.prototype.forEach = function (f) {
      this.left.forEach(f);
      f(this.key);
      this.right.forEach(f);
    };


    function $$ImmutableSet$$ImmutableSet(root, sort) {
      this.root = root;
      this.sort = sort;
      this.hash = null;
    }

    $$ImmutableSet$$ImmutableSet.prototype = Object.create($$ImmutableBase$$ImmutableBase);

    $$ImmutableSet$$ImmutableSet.prototype[$$hash$$hash_interface] = function (x) {
      if (x.hash === null) {
        var a = [];

        x.forEach(function (value) {
          a.push($$hash$$hash(value));
        });

        var spaces = "  ";

        // We don't use equal, for increased speed
        if (x.sort === $$Sorted$$defaultSort) {
          x.hash = "(Set" + $$util$$join_lines(a, spaces) + ")";
        } else {
          x.hash = "(SortedSet " + $$hash$$hash(x.sort) + $$util$$join_lines(a, spaces) + ")";
        }
      }

      return x.hash;
    };

    $$ImmutableSet$$ImmutableSet.prototype[$$toJS$$toJS_interface] = $$toJS$$toJS_array;

    // TODO code duplication with ImmutableDict
    // TODO Symbol.iterator
    $$ImmutableSet$$ImmutableSet.prototype.forEach = function (f) {
      this.root.forEach(f);
    };

    // TODO code duplication with ImmutableDict
    $$ImmutableSet$$ImmutableSet.prototype.isEmpty = function () {
      return this.root === $$$Immutable$nil$$nil;
    };

    // TODO code duplication with ImmutableDict
    // TODO what if `sort` suspends ?
    $$ImmutableSet$$ImmutableSet.prototype.has = function (key) {
      return $$Sorted$$key_get(this.root, this.sort, key) !== $$$Immutable$nil$$nil;
    };

    // TODO what if `sort` suspends ?
    $$ImmutableSet$$ImmutableSet.prototype.add = function (key) {
      var root = this.root;
      var sort = this.sort;
      var node = $$Sorted$$key_set(root, sort, key, new $$ImmutableSet$$SetNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, key));
      if (node === root) {
        return this;
      } else {
        return new $$ImmutableSet$$ImmutableSet(node, sort);
      }
    };

    // TODO what if `sort` suspends ?
    $$ImmutableSet$$ImmutableSet.prototype.remove = function (key) {
      var root = this.root;
      var sort = this.sort;
      var node = $$Sorted$$key_remove(root, sort, key);
      if (node === root) {
        return this;
      } else {
        return new $$ImmutableSet$$ImmutableSet(node, sort);
      }
    };

    $$ImmutableSet$$ImmutableSet.prototype.union = function (other) {
      var self = this;

      // TODO iterator
      other.forEach(function (value) {
        self = self.add(value);
      });

      return self;
    };

    $$ImmutableSet$$ImmutableSet.prototype.intersect = function (other) {
      var self = this;
      if (self.root === $$$Immutable$nil$$nil) {
        return self;

      } else {
        var out = new $$ImmutableSet$$ImmutableSet($$$Immutable$nil$$nil, self.sort);

        // TODO iterator
        other.forEach(function (value) {
          if (self.has(value)) {
            out = out.add(value);
          }
        });

        return out;
      }
    };

    $$ImmutableSet$$ImmutableSet.prototype.disjoint = function (other) {
      var self = this;

      // TODO iterator
      other.forEach(function (value) {
        if (self.has(value)) {
          self = self.remove(value);
        } else {
          self = self.add(value);
        }
      });

      return self;
    };

    // TODO what about the empty set ?
    $$ImmutableSet$$ImmutableSet.prototype.subtract = function (other) {
      var self = this;

      if (self.root !== $$$Immutable$nil$$nil) {
        // TODO iterator
        other.forEach(function (value) {
          self = self.remove(value);
        });
      }

      return self;
    };
    function $$Array$$copy(array) {
      var len = array.length;
      var out = new Array(len);

      for (var i = 0; i < len; ++i) {
        out[i] = array[i];
      }

      return out;
    }

    function $$Array$$insert(array, index, value) {
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

    function $$Array$$modify(array, index, f) {
      var old_value = array[index];
      var new_value = f(old_value);

      if (old_value === new_value) {
        return array;

      } else {
        var new_array = $$Array$$copy(array);
        new_array[index] = new_value;
        return new_array;
      }
    }

    function $$Array$$remove(array, index) {
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
    function $$Cons$$Cons(car, cdr) {
      this.car = car;
      this.cdr = cdr;
    }

    $$Cons$$Cons.prototype.forEach = function (f) {
      var self = this;
      while (self !== $$$Immutable$nil$$nil) {
        f(self.car);
        self = self.cdr;
      }
    };

    // TODO this isn't tail recursive
    $$Cons$$Cons.prototype.forEachRev = function (f) {
      this.cdr.forEachRev(f);
      f(this.car);
    };


    // It's faster to use arrays for small lists
    var $$ImmutableList$$array_limit = 125;

    var $$ImmutableList$$ceiling = Math.ceil;
    var $$ImmutableList$$floor   = Math.floor;


    function $$ImmutableList$$add_slice(slices, slice) {
      if (slices.length) {
        var last = slices[slices.length - 1];
        if (last.length + slice.length <= $$ImmutableList$$array_limit) {
          slices[slices.length - 1] = last.concat(slice);
        } else {
          slices.push(slice);
        }
      } else {
        slices.push(slice);
      }
    }

    function $$ImmutableList$$slices_to_tree1(slices, min, max) {
      if (min < max) {
        var pivot = $$ImmutableList$$floor((min + max) / 2);
        var left  = $$ImmutableList$$slices_to_tree1(slices, min, pivot);
        var right = $$ImmutableList$$slices_to_tree1(slices, pivot + 1, max);
        return new $$ImmutableList$$ArrayNode(left, right, slices[pivot]);
      } else {
        return $$$Immutable$nil$$nil;
      }
    }

    function $$ImmutableList$$slices_to_tree(slices) {
      return $$ImmutableList$$slices_to_tree1(slices, 0, slices.length);
    }

    // TODO move this into Array.js ?
    function $$ImmutableList$$array_slice(array, from, to) {
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
    function $$ImmutableList$$stack_to_array(a, size) {
      var out = new Array(size);

      while (size--) {
        out[size] = a.car;
        a = a.cdr;
      }

      return out;
    }

    function $$ImmutableList$$stack_nth(a, size, i) {
      while (--size !== i) {
        a = a.cdr;
      }

      return a.car;
    }


    function $$ImmutableList$$ArrayNode(left, right, array) {
      this.left  = left;
      this.right = right;
      this.array = array;
      this.size  = left.size + right.size + array.length;
      this.depth = $$AVL$$max(left.depth, right.depth) + 1;
    }

    $$ImmutableList$$ArrayNode.prototype.copy = function (left, right) {
      return new $$ImmutableList$$ArrayNode(left, right, this.array);
    };

    $$ImmutableList$$ArrayNode.prototype.forEach = function (f) {
      this.left.forEach(f);
      this.array.forEach(function (x) {
        f(x);
      });
      this.right.forEach(f);
    };


    function $$ImmutableList$$nth_has(index, len) {
      return index >= 0 && index < len;
    }

    function $$ImmutableList$$nth_get(node, index) {
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

    function $$ImmutableList$$nth_insert(node, index, value) {
      // TODO is this necessary ?
      if (node === $$$Immutable$nil$$nil) {
        return new $$ImmutableList$$ArrayNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, [value]);

      } else {
        var left    = node.left;
        var right   = node.right;
        var l_index = left.size;

        if (index < l_index) {
          var child = $$ImmutableList$$nth_insert(left, index, value);
          return $$AVL$$balanced_node(node, child, right);

        } else {
          index -= l_index;

          var array = node.array;
          var len   = array.length;
          // TODO test this
          if (index <= len) {
            array = $$Array$$insert(array, index, value);

            // TODO this fails when array_limit is 1
            if (len === $$ImmutableList$$array_limit) {
              var pivot  = $$ImmutableList$$ceiling(array.length / 2);
              var aleft  = array.slice(0, pivot);
              var aright = array.slice(pivot);

              if (left.depth < right.depth) {
                return new $$ImmutableList$$ArrayNode($$AVL$$insert_max(left, new $$ImmutableList$$ArrayNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, aleft)), right, aright);
              } else {
                return new $$ImmutableList$$ArrayNode(left, $$AVL$$insert_min(right, new $$ImmutableList$$ArrayNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, aright)), aleft);
              }

            } else {
              return new $$ImmutableList$$ArrayNode(left, right, array);
            }

          } else {
            var child = $$ImmutableList$$nth_insert(right, index - len, value);
            return $$AVL$$balanced_node(node, left, child);
          }
        }
      }
    }

    function $$ImmutableList$$nth_modify(node, index, f) {
      var left    = node.left;
      var right   = node.right;
      var l_index = left.size;

      if (index < l_index) {
        var child = $$ImmutableList$$nth_modify(left, index, f);
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
          var new_array = $$Array$$modify(array, index, f);
          if (new_array === array) {
            return node;
          } else {
            return new $$ImmutableList$$ArrayNode(left, right, new_array);
          }

        } else {
          var child = $$ImmutableList$$nth_modify(right, index - len, f);
          if (child === right) {
            return node;
          } else {
            return node.copy(left, child); // TODO test this
          }
        }
      }
    }

    function $$ImmutableList$$nth_remove(node, index) {
      var left    = node.left;
      var right   = node.right;
      var l_index = left.size;

      if (index < l_index) {
        var child = $$ImmutableList$$nth_remove(left, index);
        return $$AVL$$balanced_node(node, child, right);

      } else {
        index -= l_index;

        var array = node.array;
        var len   = array.length;
        // TODO test this
        if (index < len) {
          // TODO use `array.length === 1` so we can skip the call to `array_remove`
          array = $$Array$$remove(array, index);

          if (array.length === 0) {
            return $$AVL$$concat(left, right);
          } else {
            return new $$ImmutableList$$ArrayNode(left, right, array);
          }

        } else {
          var child = $$ImmutableList$$nth_remove(right, index - len);
          return $$AVL$$balanced_node(node, left, child);
        }
      }
    }

    function $$ImmutableList$$nth_slice(slices, node, from, to) {
      if (node !== $$$Immutable$nil$$nil) {
        var left = node.left;
        var size = left.size;

        if (from < size) {
          $$ImmutableList$$nth_slice(slices, left, from, to);
        }

        var array = node.array;
        var len   = array.length;

        from -= size;
        to   -= size;

        if (from < len && to > 0) {
          $$ImmutableList$$add_slice(slices, $$ImmutableList$$array_slice(array, from, to));
        }

        if (to > len) {
          $$ImmutableList$$nth_slice(slices, node.right, from - len, to - len);
        }
      }
    }


    function $$ImmutableList$$ImmutableList(root, tail, tail_size) {
      this.root = root;
      this.tail = tail;
      this.tail_size = tail_size;
      this.hash = null;
    }

    $$ImmutableList$$ImmutableList.prototype = Object.create($$ImmutableBase$$ImmutableBase);

    $$ImmutableList$$ImmutableList.prototype[$$hash$$hash_interface] = function (x) {
      if (x.hash === null) {
        var a = [];

        x.forEach(function (x) {
          a.push($$hash$$hash(x));
        });

        x.hash = "(List" + $$util$$join_lines(a, "  ") + ")";
      }

      return x.hash;
    };

    $$ImmutableList$$ImmutableList.prototype[$$toJS$$toJS_interface] = $$toJS$$toJS_array;

    // TODO Symbol.iterator
    $$ImmutableList$$ImmutableList.prototype.forEach = function (f) {
      this.root.forEach(f);
      this.tail.forEachRev(f);
    };

    $$ImmutableList$$ImmutableList.prototype.isEmpty = function () {
      return this.root === $$$Immutable$nil$$nil && this.tail === $$$Immutable$nil$$nil;
    };

    $$ImmutableList$$ImmutableList.prototype.size = function () {
      return this.root.size + this.tail_size;
    };

    $$ImmutableList$$ImmutableList.prototype.has = function (index) {
      var len = this.size();

      if (index < 0) {
        index += len;
      }

      return $$ImmutableList$$nth_has(index, len);
    };

    $$ImmutableList$$ImmutableList.prototype.get = function (index, def) {
      var len = this.size();

      if (index < 0) {
        index += len;
      }

      if ($$ImmutableList$$nth_has(index, len)) {
        var root = this.root;
        var size = root.size;
        if (index < size) {
          return $$ImmutableList$$nth_get(root, index);
        } else {
          return $$ImmutableList$$stack_nth(this.tail, this.tail_size, index - size);
        }

      } else if (arguments.length === 2) {
        return def;

      } else {
        throw new Error("Index " + index + " is not valid");
      }
    };

    $$ImmutableList$$ImmutableList.prototype.insert = function (value, index) {
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
        if (tail_size === $$ImmutableList$$array_limit) {
          var node = $$AVL$$insert_max(root, new $$ImmutableList$$ArrayNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, $$ImmutableList$$stack_to_array(tail, tail_size)));
          return new $$ImmutableList$$ImmutableList(node, new $$Cons$$Cons(value, $$$Immutable$nil$$nil), 1);

        } else {
          return new $$ImmutableList$$ImmutableList(root, new $$Cons$$Cons(value, tail), tail_size + 1);
        }

      } else if ($$ImmutableList$$nth_has(index, len)) {
        var size = root.size;
        // TODO should this be <= ?
        if (index < size) {
          return new $$ImmutableList$$ImmutableList($$ImmutableList$$nth_insert(root, index, value), tail, tail_size);

        } else {
          var array = $$Array$$insert($$ImmutableList$$stack_to_array(tail, tail_size), index - size, value);
          var node  = $$AVL$$insert_max(root, new $$ImmutableList$$ArrayNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, array));
          return new $$ImmutableList$$ImmutableList(node, $$$Immutable$nil$$nil, 0);
        }

      } else {
        throw new Error("Index " + index + " is not valid");
      }
    };

    $$ImmutableList$$ImmutableList.prototype.remove = function (index) {
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

      if (tail !== $$$Immutable$nil$$nil && index === len - 1) {
        return new $$ImmutableList$$ImmutableList(root, tail.cdr, tail_size - 1);

      } else if ($$ImmutableList$$nth_has(index, len)) {
        var size = root.size;
        if (index < size) {
          return new $$ImmutableList$$ImmutableList($$ImmutableList$$nth_remove(root, index), tail, tail_size);

        } else {
          var array = $$Array$$remove($$ImmutableList$$stack_to_array(tail, tail_size), index - size);
          var node  = $$AVL$$insert_max(root, new $$ImmutableList$$ArrayNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, array));
          return new $$ImmutableList$$ImmutableList(node, $$$Immutable$nil$$nil, 0);
        }

      } else {
        throw new Error("Index " + index + " is not valid");
      }
    };

    $$ImmutableList$$ImmutableList.prototype.modify = function (index, f) {
      var len = this.size();

      if (index < 0) {
        index += len;
      }

      if ($$ImmutableList$$nth_has(index, len)) {
        var root = this.root;
        var tail = this.tail;
        var tail_size = this.tail_size;
        var size = root.size;

        if (tail !== $$$Immutable$nil$$nil && index === len - 1) {
          var value = f(tail.car);
          if (value === tail.car) {
            return this;
          } else {
            return new $$ImmutableList$$ImmutableList(root, new $$Cons$$Cons(value, tail.cdr), tail_size);
          }

        } else if (index < size) {
          var node = $$ImmutableList$$nth_modify(root, index, f);
          if (node === root) {
            return this;
          } else {
            return new $$ImmutableList$$ImmutableList(node, tail, tail_size);
          }

        } else {
          var stack = $$ImmutableList$$stack_to_array(tail, tail_size);
          var array = $$Array$$modify(stack, index - size, f);
          if (array === stack) {
            return this;
          } else {
            var node = $$AVL$$insert_max(root, new $$ImmutableList$$ArrayNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, array));
            return new $$ImmutableList$$ImmutableList(node, $$$Immutable$nil$$nil, 0);
          }
        }

      } else {
        throw new Error("Index " + index + " is not valid");
      }
    };

    $$ImmutableList$$ImmutableList.prototype.slice = function (from, to) {
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

      } else if ($$ImmutableList$$nth_has(from, len)) {
        if (from === to) {
          return new $$ImmutableList$$ImmutableList($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, 0);

        // TODO code duplication with nth_has ?
        } else if (to > 0 && to <= len) {
          var root = this.root;
          var size = root.size;

          var slices = [];

          if (from <= size) {
            $$ImmutableList$$nth_slice(slices, root, from, to);
          }

          if (to > size) {
            var stack = $$ImmutableList$$stack_to_array(this.tail, this.tail_size);
            $$ImmutableList$$add_slice(slices, $$ImmutableList$$array_slice(stack, from - size, to - size));
          }

          return new $$ImmutableList$$ImmutableList($$ImmutableList$$slices_to_tree(slices), $$$Immutable$nil$$nil, 0);

        } else {
          throw new Error("Index " + to + " is not valid");
        }

      } else {
        throw new Error("Index " + from + " is not valid");
      }
    };

    $$ImmutableList$$ImmutableList.prototype.concat = function (right) {
      if (right instanceof $$ImmutableList$$ImmutableList) {
        var lroot = this.root;
        var ltail = this.tail;

        var rroot = right.root;
        var rtail = right.tail;

        if (rroot === $$$Immutable$nil$$nil && rtail === $$$Immutable$nil$$nil) {
          return this;

        } else if (lroot === $$$Immutable$nil$$nil && ltail === $$$Immutable$nil$$nil) {
          return right;

        } else {
          if (ltail !== $$$Immutable$nil$$nil) {
            lroot = $$AVL$$insert_max(lroot, new $$ImmutableList$$ArrayNode($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, $$ImmutableList$$stack_to_array(ltail, this.tail_size)));
          }

          var node = $$AVL$$concat(lroot, rroot);
          return new $$ImmutableList$$ImmutableList(node, rtail, right.tail_size);
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
    };*/;
    function $$ImmutableQueue$$ImmutableQueue(left, right, len) {
      this.left  = left;
      this.right = right;
      this.len   = len;
      this.hash  = null;
    }

    $$ImmutableQueue$$ImmutableQueue.prototype = Object.create($$ImmutableBase$$ImmutableBase);

    $$ImmutableQueue$$ImmutableQueue.prototype[$$toJS$$toJS_interface] = $$toJS$$toJS_array;

    $$ImmutableQueue$$ImmutableQueue.prototype.isEmpty = function () {
      return this.left === $$$Immutable$nil$$nil && this.right === $$$Immutable$nil$$nil;
    };

    $$ImmutableQueue$$ImmutableQueue.prototype.forEach = function (f) {
      this.left.forEach(f);
      this.right.forEachRev(f);
    };

    $$ImmutableQueue$$ImmutableQueue.prototype[$$hash$$hash_interface] = function (x) {
      if (x.hash === null) {
        var a = [];

        x.forEach(function (x) {
          a.push($$hash$$hash(x));
        });

        x.hash = "(Queue" + $$util$$join_lines(a, "  ") + ")";
      }

      return x.hash;
    };

    $$ImmutableQueue$$ImmutableQueue.prototype.size = function () {
      return this.len;
    };

    $$ImmutableQueue$$ImmutableQueue.prototype.peek = function (def) {
      if (this.isEmpty()) {
        if (arguments.length === 1) {
          return def;
        } else {
          throw new Error("Cannot peek from an empty queue");
        }
      } else {
        return this.left.car;
      }
    };

    $$ImmutableQueue$$ImmutableQueue.prototype.push = function (value) {
      if (this.isEmpty()) {
        return new $$ImmutableQueue$$ImmutableQueue(new $$Cons$$Cons(value, this.left), this.right, this.len + 1);
      } else {
        return new $$ImmutableQueue$$ImmutableQueue(this.left, new $$Cons$$Cons(value, this.right), this.len + 1);
      }
    };

    $$ImmutableQueue$$ImmutableQueue.prototype.pop = function () {
      if (this.isEmpty()) {
        throw new Error("Cannot pop from an empty queue");
      } else {
        var left = this.left.cdr;
        if (left === $$$Immutable$nil$$nil) {
          var right = $$$Immutable$nil$$nil;

          this.right.forEach(function (x) {
            right = new $$Cons$$Cons(x, right);
          });

          return new $$ImmutableQueue$$ImmutableQueue(right, $$$Immutable$nil$$nil, this.len - 1);
        } else {
          return new $$ImmutableQueue$$ImmutableQueue(left, this.right, this.len - 1);
        }
      }
    };

    $$ImmutableQueue$$ImmutableQueue.prototype.concat = function (right) {
      var self = this;

      right.forEach(function (x) {
        self = self.push(x);
      });

      return self;
    };
    function $$ImmutableStack$$ImmutableStack(root, len) {
      this.root = root;
      this.len  = len;
      this.hash = null;
    }

    $$ImmutableStack$$ImmutableStack.prototype = Object.create($$ImmutableBase$$ImmutableBase);

    $$ImmutableStack$$ImmutableStack.prototype[$$toJS$$toJS_interface] = $$toJS$$toJS_array;

    // TODO code duplication with ImmutableSet
    $$ImmutableStack$$ImmutableStack.prototype.isEmpty = function () {
      return this.root === $$$Immutable$nil$$nil;
    };

    // TODO code duplication
    $$ImmutableStack$$ImmutableStack.prototype[$$hash$$hash_interface] = function (x) {
      if (x.hash === null) {
        var a = [];

        x.forEach(function (x) {
          a.push($$hash$$hash(x));
        });

        x.hash = "(Stack" + $$util$$join_lines(a, "  ") + ")";
      }

      return x.hash;
    };

    $$ImmutableStack$$ImmutableStack.prototype.forEach = function (f) {
      this.root.forEachRev(f);
    };

    // TODO code duplication with ImmutableQueue
    $$ImmutableStack$$ImmutableStack.prototype.size = function () {
      return this.len;
    };

    $$ImmutableStack$$ImmutableStack.prototype.peek = function (def) {
      if (this.isEmpty()) {
        if (arguments.length === 1) {
          return def;
        } else {
          throw new Error("Cannot peek from an empty stack");
        }
      } else {
        return this.root.car;
      }
    };

    $$ImmutableStack$$ImmutableStack.prototype.push = function (value) {
      return new $$ImmutableStack$$ImmutableStack(new $$Cons$$Cons(value, this.root), this.len + 1);
    };

    $$ImmutableStack$$ImmutableStack.prototype.pop = function () {
      if (this.isEmpty()) {
        throw new Error("Cannot pop from an empty stack");
      } else {
        return new $$ImmutableStack$$ImmutableStack(this.root.cdr, this.len - 1);
      }
    };

    // TODO code duplication with ImmutableQueue
    $$ImmutableStack$$ImmutableStack.prototype.concat = function (right) {
      var self = this;

      right.forEach(function (x) {
        self = self.push(x);
      });

      return self;
    };
    function $$ImmutableRecord$$ImmutableRecord(keys, values) {
      this.keys   = keys;
      this.values = values;
      this.hash   = null;
    }

    $$ImmutableRecord$$ImmutableRecord.prototype = Object.create($$ImmutableBase$$ImmutableBase);

    $$ImmutableRecord$$ImmutableRecord.prototype[$$toJS$$toJS_interface] = $$toJS$$toJS_object;

    $$ImmutableRecord$$ImmutableRecord.prototype[$$hash$$hash_interface] = function (x) {
      if (x.hash === null) {
        x.hash = "(Record" + $$hash$$hash_dict(x, "  ") + ")";
      }

      return x.hash;
    };

    $$ImmutableRecord$$ImmutableRecord.prototype.forEach = function (f) {
      var keys   = this.keys;
      var values = this.values;
      for (var s in keys) {
        var index = keys[s];
        f([s, values[index]]);
      }
    };

    $$ImmutableRecord$$ImmutableRecord.prototype.get = function (key) {
      // TODO code duplication
      if (typeof key !== "string") {
        throw new Error("Expected string key but got " + key);
      }

      var index = this.keys[key];
      if (index == null) {
        throw new Error("Key " + key + " not found");

      } else {
        return this.values[index];
      }
    };

    $$ImmutableRecord$$ImmutableRecord.prototype.set = function (key, value) {
      return this.modify(key, function () {
        return value;
      });
    };

    $$ImmutableRecord$$ImmutableRecord.prototype.modify = function (key, f) {
      // TODO code duplication
      if (typeof key !== "string") {
        throw new Error("Expected string key but got " + key);
      }

      var keys  = this.keys;
      var index = keys[key];
      if (index == null) {
        throw new Error("Key " + key + " not found");

      } else {
        var values = this.values;
        var array  = $$Array$$modify(values, index, f);
        if (array === values) {
          return this;
        } else {
          return new $$ImmutableRecord$$ImmutableRecord(keys, array);
        }
      }
    };

    // TODO code duplication with ImmutableDict
    $$ImmutableRecord$$ImmutableRecord.prototype.update = function (other) {
      var self = this;

      other.forEach(function (_array) {
        var key   = _array[0];
        var value = _array[1];

        self = self.set(key, value);
      });

      return self;
    };
    function $$$Immutable$Immutable$$equal(x, y) {
      return x === y || $$hash$$hash(x) === $$hash$$hash(y);
    }

    function $$$Immutable$Immutable$$isDict(x) {
      return x instanceof $$ImmutableDict$$ImmutableDict;
    }

    function $$$Immutable$Immutable$$isSet(x) {
      return x instanceof $$ImmutableSet$$ImmutableSet;
    }

    function $$$Immutable$Immutable$$isSortedDict(x) {
      return $$$Immutable$Immutable$$isDict(x) && x.sort !== $$Sorted$$defaultSort;
    }

    function $$$Immutable$Immutable$$isSortedSet(x) {
      return $$$Immutable$Immutable$$isSet(x) && x.sort !== $$Sorted$$defaultSort;
    }

    function $$$Immutable$Immutable$$isList(x) {
      return x instanceof $$ImmutableList$$ImmutableList;
    }

    function $$$Immutable$Immutable$$isQueue(x) {
      return x instanceof $$ImmutableQueue$$ImmutableQueue;
    }

    function $$$Immutable$Immutable$$isStack(x) {
      return x instanceof $$ImmutableStack$$ImmutableStack;
    }

    function $$$Immutable$Immutable$$isRecord(x) {
      return x instanceof $$ImmutableRecord$$ImmutableRecord;
    }

    function $$$Immutable$Immutable$$isImmutable(x) {
      return $$$Immutable$Immutable$$isDict(x) || $$$Immutable$Immutable$$isSet(x) || $$$Immutable$Immutable$$isList(x) || $$$Immutable$Immutable$$isQueue(x) || $$$Immutable$Immutable$$isStack(x) || $$$Immutable$Immutable$$isRecord(x);
    }

    function $$$Immutable$Immutable$$fromJS(x) {
      if (Array.isArray(x)) {
        var out = $$$Immutable$Immutable$$List();

        for (var i = 0, l = x.length; i < l; ++i) {
          out = out.insert($$$Immutable$Immutable$$fromJS(x[i]));
        }

        return out;

      } else if ($$util$$isJSLiteral(x)) {
        var out = $$$Immutable$Immutable$$Dict();

        // TODO should this only include own properties ...?
        for (var s in x) {
          out = out.set(s, $$$Immutable$Immutable$$fromJS(x[s]));
        }

        return out;

      } else {
        return x;
      }
    }

    function $$$Immutable$Immutable$$Record(obj) {
      var keys   = {};
      var values = [];

      if (obj != null) {
        if (obj instanceof $$ImmutableRecord$$ImmutableRecord) {
          return obj;

        } else if ($$util$$isJSLiteral(obj)) {
          Object.keys(obj).forEach(function (key) {
            // TODO code duplication
            if (typeof key !== "string") {
              throw new Error("Expected string key but got " + key);
            }

            keys[key] = values.push(obj[key]) - 1;
          });

        } else {
          obj.forEach(function (_array) {
            var key   = _array[0];
            var value = _array[1];

            // TODO code duplication
            if (typeof key !== "string") {
              throw new Error("Expected string key but got " + key);
            }

            keys[key] = values.push(value) - 1;
          });
        }
      }

      return new $$ImmutableRecord$$ImmutableRecord(keys, values);
    }

    function $$$Immutable$Immutable$$SortedDict(sort, obj) {
      if (obj != null) {
        // We don't use equal, for increased speed
        if (obj instanceof $$ImmutableDict$$ImmutableDict && obj.sort === sort) {
          return obj;

        } else {
          var o = new $$ImmutableDict$$ImmutableDict($$$Immutable$nil$$nil, sort);

          if ($$util$$isJSLiteral(obj)) {
            Object.keys(obj).forEach(function (key) {
              o = o.set(key, obj[key]);
            });

          } else {
            obj.forEach(function (_array) {
              var key   = _array[0];
              var value = _array[1];
              o = o.set(key, value);
            });
          }

          return o;
        }
      } else {
        return new $$ImmutableDict$$ImmutableDict($$$Immutable$nil$$nil, sort);
      }
    }

    function $$$Immutable$Immutable$$SortedSet(sort, array) {
      if (array != null) {
        // We don't use equal, for increased speed
        if (array instanceof $$ImmutableSet$$ImmutableSet && array.sort === sort) {
          return array;

        } else {
          // TODO use concat ?
          var o = new $$ImmutableSet$$ImmutableSet($$$Immutable$nil$$nil, sort);

          array.forEach(function (x) {
            o = o.add(x);
          });

          return o;
        }
      } else {
        return new $$ImmutableSet$$ImmutableSet($$$Immutable$nil$$nil, sort);
      }
    }

    function $$$Immutable$Immutable$$Dict(obj) {
      return $$$Immutable$Immutable$$SortedDict($$Sorted$$defaultSort, obj);
    }

    function $$$Immutable$Immutable$$Set(array) {
      return $$$Immutable$Immutable$$SortedSet($$Sorted$$defaultSort, array);
    }

    function $$$Immutable$Immutable$$List(array) {
      if (array != null) {
        if (array instanceof $$ImmutableList$$ImmutableList) {
          return array;

        } else {
          var o = new $$ImmutableList$$ImmutableList($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, 0);

          array.forEach(function (x) {
            o = o.insert(x);
          });

          return o;
        }
      } else {
        return new $$ImmutableList$$ImmutableList($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, 0);
      }
    }

    function $$$Immutable$Immutable$$Queue(x) {
      if (x != null) {
        if (x instanceof $$ImmutableQueue$$ImmutableQueue) {
          return x;

        } else {
          // TODO use concat ?
          var o = new $$ImmutableQueue$$ImmutableQueue($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, 0);

          x.forEach(function (x) {
            o = o.push(x);
          });

          return o;
        }
      } else {
        return new $$ImmutableQueue$$ImmutableQueue($$$Immutable$nil$$nil, $$$Immutable$nil$$nil, 0);
      }
    }

    function $$$Immutable$Immutable$$Stack(x) {
      if (x != null) {
        if (x instanceof $$ImmutableStack$$ImmutableStack) {
          return x;

        } else {
          // TODO use concat ?
          var o = new $$ImmutableStack$$ImmutableStack($$$Immutable$nil$$nil, 0);

          x.forEach(function (x) {
            o = o.push(x);
          });

          return o;
        }
      } else {
        return new $$ImmutableStack$$ImmutableStack($$$Immutable$nil$$nil, 0);
      }
    }


    (function (root, fn) {
      if (typeof define === 'function' && define.amd) {
        define(["exports"], fn);
      } else if (typeof exports === 'object') {
        fn(exports);
      } else {
        root.Immutable = {};
        fn(root.Immutable);
      }
    })(this, function (exports) {
      exports.equal = $$$Immutable$Immutable$$equal;
      exports.fromJS = $$$Immutable$Immutable$$fromJS;
      exports.toJS = $$toJS$$toJS;
      exports.isDict = $$$Immutable$Immutable$$isDict;
      exports.isSet = $$$Immutable$Immutable$$isSet;
      exports.isSortedDict = $$$Immutable$Immutable$$isSortedDict;
      exports.isSortedSet = $$$Immutable$Immutable$$isSortedSet;
      exports.isList = $$$Immutable$Immutable$$isList;
      exports.isQueue = $$$Immutable$Immutable$$isQueue;
      exports.isStack = $$$Immutable$Immutable$$isStack;
      exports.isImmutable = $$$Immutable$Immutable$$isImmutable;
      exports.SortedDict = $$$Immutable$Immutable$$SortedDict;
      exports.SortedSet = $$$Immutable$Immutable$$SortedSet;
      exports.Dict = $$$Immutable$Immutable$$Dict;
      exports.Set = $$$Immutable$Immutable$$Set;
      exports.List = $$$Immutable$Immutable$$List;
      exports.Queue = $$$Immutable$Immutable$$Queue;
      exports.Stack = $$$Immutable$Immutable$$Stack;
      exports.simpleSort = $$Sorted$$simpleSort;
      exports.defaultSort = $$Sorted$$defaultSort;
      exports.isRecord = $$$Immutable$Immutable$$isRecord;
      exports.Record = $$$Immutable$Immutable$$Record;
    });
    function $$assert$$assert(x) {
      if (arguments.length !== 1) {
        throw new Error("Invalid argument length");
      }
      if (!x) {
        throw new Error("Failed: " + x);
      }
    }


    // TODO move this into a different module
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    function src$Test$Test$$randomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    // http://bost.ocks.org/mike/shuffle/
    // TODO test whether this algorithm has statistical bias or not
    // TODO this is only needed for "test/test.js"
    function src$Test$Test$$shuffle(array) {
      var i = array.length;

      while (i) {
        var j = src$Test$Test$$randomInt(0, i);
        --i;
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }


    var src$Test$Test$$TESTS_SUCCEEDED = 0;
    var src$Test$Test$$TESTS_FAILED = 0;
    var src$Test$Test$$CONTEXT = null;

    function src$Test$Test$$context(s, f) {
      var old_context = src$Test$Test$$CONTEXT;
      src$Test$Test$$CONTEXT = s;
      try {
        f();
      } finally {
        src$Test$Test$$CONTEXT = old_context;
      }
    }

    function src$Test$Test$$test(s, f) {
      try {
        f();
        ++src$Test$Test$$TESTS_SUCCEEDED;
      } catch (e) {
        ++src$Test$Test$$TESTS_FAILED;
        console.log("");
        console.log("*** " + (src$Test$Test$$CONTEXT ? src$Test$Test$$CONTEXT + "." : "") + s + " FAILED");
        console.log(e.stack);
        console.log("");
      }
    }

    function src$Test$Test$$assert_raises(f, message) {
      try {
        f();
        throw new Error("Expected an error, but it did not happen");
      } catch (e) {
        if (e.message !== message) {
          throw new Error("Expected \"" + message + "\" but got \"" + e.message + "\"");
        }
      }
    }

    //var { zip, toArray } = require('sjs:sequence');

    function src$Test$Test$$isObject(x) {
      return Object(x) === x;
    }

    var src$Test$Test$$hasOwnProperty = {}.hasOwnProperty;

    /*function shallowEqual(x, y) {
      if (Array.isArray(x) && Array.isArray(y)) {
        if (x.length === y.length) {
          for (var i = 0, l = x.length; i < l; ++i) {
            if (x[i] !== y[i]) {
              return false;
            }
          }
          return true;
        } else {
          return false;
        }
      } else {
        return x === y;
      }
    }*/

    function src$Test$Test$$deepEqual(x, y) {
      if (x === y) {
        return true;

      } else if (Array.isArray(x) && Array.isArray(y)) {
        if (x.length === y.length) {
          for (var i = 0, l = x.length; i < l; ++i) {
            if (!src$Test$Test$$deepEqual(x[i], y[i])) {
              return false;
            }
          }
          return true;
        } else {
          return false;
        }

      } else if (src$Test$Test$$isObject(x) && src$Test$Test$$isObject(y)) {
        if (Object.getPrototypeOf(x) === Object.getPrototypeOf(y)) {
          var x_keys = Object.getOwnPropertyNames(x);
          var y_keys = Object.getOwnPropertyNames(y);

          for (var i = 0, l = x_keys.length; i < l; ++i) {
            var s = x_keys[i];
            if (src$Test$Test$$hasOwnProperty.call(y, s)) {
              if (!src$Test$Test$$deepEqual(x[s], y[s])) {
                return false;
              }
            } else {
              return false;
            }
          }

          for (var i = 0, l = y_keys.length; i < l; ++i) {
            var s = y_keys[i];
            if (!src$Test$Test$$hasOwnProperty.call(x, s)) {
              return false;
            }
          }

          return true;

        } else {
          return false;
        }

      } else {
        return false;
      }
    }

    function src$Test$Test$$test_forEach(constructor, input) {
      var a = [];
      constructor(input).forEach(function (x) {
        a.push(x);
      });
      $$assert$$assert(src$Test$Test$$deepEqual(a, input));
    }



    // TODO test that this works correctly
    function src$Test$Test$$verify_dict(tree, obj) {
      var sort = tree.sort;

      function loop(node, lt, gt) {
        if (node !== $$$Immutable$nil$$nil) {
          var left  = node.left;
          var right = node.right;

          $$assert$$assert(node.depth === Math.max(left.depth, right.depth) + 1);

          var diff = left.depth - right.depth;
          $$assert$$assert(diff === -1 || diff === 0 || diff === 1);

          // Every left node must be lower than the parent node
          lt.forEach(function (parent) {
            $$assert$$assert(sort(node.key, parent.key) < 0);
          });

          // Every right node must be greater than the parent node
          gt.forEach(function (parent) {
            $$assert$$assert(sort(node.key, parent.key) > 0);
          });

          loop(left,  lt.concat([node]), gt);
          loop(right, lt, gt.concat([node]));
        }
      }
      loop(tree.root, [], []);

      $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(tree), obj));

      return tree;
    }

    function src$Test$Test$$verify_set(tree, array) {
      return src$Test$Test$$verify_dict(tree, array);
    }

    function src$Test$Test$$verify_list(tree, array) {
      function loop(node) {
        if (node !== $$$Immutable$nil$$nil) {
          var left  = node.left;
          var right = node.right;

          $$assert$$assert(node.depth === Math.max(left.depth, right.depth) + 1);

          var diff = left.depth - right.depth;
          $$assert$$assert(diff === -1 || diff === 0 || diff === 1);

          $$assert$$assert(node.array.length <= 125);

          $$assert$$assert(node.size === left.size + right.size + node.array.length);
          loop(left);
          loop(right);
        }
      }
      loop(tree.root);

      var count = 0;
      var cons = tree.tail;
      while (cons !== $$$Immutable$nil$$nil) {
        ++count;
        cons = cons.cdr;
      }

      $$assert$$assert(count === tree.tail_size);
      $$assert$$assert(tree.tail_size <= 125);

      $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(tree), array));

      return tree;
    }

    function src$Test$Test$$verify_queue(queue, array) {
      if (!queue.isEmpty()) {
        $$assert$$assert(queue.left !== $$$Immutable$nil$$nil);
      }

      $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(queue), array));

      return queue;
    }

    function src$Test$Test$$verify_stack(stack, array) {
      $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(stack), array));

      return stack;
    }

    function src$Test$Test$$verify_record(record, obj) {
      var count = 0;

      for (var s in record.keys) {
        ++count;
      }

      $$assert$$assert(count === record.values.length);

      $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(record), obj));

      return record;
    }

    function src$Test$Test$$random_int(max) {
      return Math.floor(Math.random() * max);
    }

    function src$Test$Test$$random_list(max) {
      var out = [];
      for (var i = 0; i < max; ++i) {
        out.push(i);
      }
      src$Test$Test$$shuffle(out);
      return out;
    }


    src$Test$Test$$context("Dict", function () {
      var dict_empty = $$$Immutable$Immutable$$Dict();
      var dict_foo   = $$$Immutable$Immutable$$Dict().set("foo", 1);

      src$Test$Test$$test("isDict", function () {
        $$assert$$assert(!$$$Immutable$Immutable$$isDict($$$Immutable$Immutable$$Set()));

        $$assert$$assert($$$Immutable$Immutable$$isDict($$$Immutable$Immutable$$Dict()));
        $$assert$$assert($$$Immutable$Immutable$$isDict($$$Immutable$Immutable$$SortedDict($$Sorted$$defaultSort)));

        $$assert$$assert($$$Immutable$Immutable$$isSortedDict($$$Immutable$Immutable$$SortedDict($$Sorted$$simpleSort)));
        $$assert$$assert(!$$$Immutable$Immutable$$isSortedDict($$$Immutable$Immutable$$SortedDict($$Sorted$$defaultSort)));
        $$assert$$assert(!$$$Immutable$Immutable$$isSortedDict($$$Immutable$Immutable$$Dict()));
      });

      src$Test$Test$$test("verify", function () {
        src$Test$Test$$verify_dict(dict_empty, {});
        src$Test$Test$$verify_dict(dict_foo, { foo: 1 });
      });

      src$Test$Test$$test("init", function () {
        var x = $$$Immutable$Immutable$$Dict({ foo: 1 });
        src$Test$Test$$verify_dict(x, { foo: 1 });
        $$assert$$assert($$$Immutable$Immutable$$equal(x, dict_foo));
        $$assert$$assert($$$Immutable$Immutable$$equal(dict_foo, x));
      });

      src$Test$Test$$test("isEmpty", function () {
        $$assert$$assert(dict_empty.isEmpty());
        $$assert$$assert(!dict_foo.isEmpty());
      });

      src$Test$Test$$test("has", function () {
        $$assert$$assert(!dict_empty.has("foo"));
        $$assert$$assert(!dict_empty.has("bar"));

        $$assert$$assert(dict_foo.has("foo"));
        $$assert$$assert(!dict_foo.has("bar"));
      });

      src$Test$Test$$test("get", function () {
        src$Test$Test$$assert_raises(function () {
          dict_empty.get("foo");
        }, "Key foo not found");

        $$assert$$assert(dict_empty.get("foo", 50) === 50);

        $$assert$$assert(dict_foo.get("foo") === 1);
        $$assert$$assert(dict_foo.get("foo", 50) === 1);
      });

      src$Test$Test$$test("set", function () {
        var dict_bar = dict_empty.set("bar", 2);
        $$assert$$assert(!dict_empty.has("bar"));
        $$assert$$assert(dict_bar.has("bar"));
        $$assert$$assert(dict_bar.get("bar") === 2);

        var dict_foo2 = dict_foo.set("foo", 3);
        $$assert$$assert(dict_foo.get("foo") === 1);
        $$assert$$assert(dict_foo2.get("foo") === 3);
      });

      src$Test$Test$$test("modify", function () {
        var ran = false;

        src$Test$Test$$assert_raises(function () {
          dict_empty.modify("foo", function (x) {
            ran = true;
            return x + 1;
          });
        }, "Key foo not found");

        $$assert$$assert(ran === false);


        var ran = false;

        var dict_foo2 = dict_foo.modify("foo", function (x) {
          ran = true;
          $$assert$$assert(x === 1);
          return x + 5;
        });

        $$assert$$assert(ran === true);

        $$assert$$assert(dict_foo.get("foo") === 1);
        $$assert$$assert(dict_foo2.get("foo") === 6);
      });

      src$Test$Test$$test("remove", function () {
        $$assert$$assert(!dict_empty.has("foo"));

        var dict_empty2 = dict_empty.remove("foo");
        $$assert$$assert(!dict_empty2.has("foo"));

        var dict_foo2 = dict_foo.remove("foo");
        $$assert$$assert(dict_foo.has("foo"));
        $$assert$$assert(!dict_foo2.has("foo"));
      });

      src$Test$Test$$test("merge", function () {
        src$Test$Test$$verify_dict($$$Immutable$Immutable$$Dict({ foo: 1 }), { foo: 1 });
        src$Test$Test$$verify_dict($$$Immutable$Immutable$$Dict({ foo: 1 }).merge([]), { foo: 1 });
        src$Test$Test$$verify_dict($$$Immutable$Immutable$$Dict({ foo: 1 }).merge([["bar", 2]]), { foo: 1, bar: 2 });
        src$Test$Test$$verify_dict($$$Immutable$Immutable$$Dict({ foo: 1 }).merge($$$Immutable$Immutable$$Dict({ bar: 2 })), { foo: 1, bar: 2 });
        src$Test$Test$$verify_dict($$$Immutable$Immutable$$Dict({ foo: 1 }).merge($$$Immutable$Immutable$$Dict({ foo: 2 })), { foo: 2 });
        src$Test$Test$$verify_dict($$$Immutable$Immutable$$Dict({ foo: 1 }).merge($$$Immutable$Immutable$$Dict({ foo: 2, bar: 3 })), { foo: 2, bar: 3 });
      });

      src$Test$Test$$test("complex keys", function () {
        var o = $$$Immutable$Immutable$$Dict();

        var m1 = {};
        var m2 = {};

        var i1 = $$$Immutable$Immutable$$Dict();
        var i2 = $$$Immutable$Immutable$$Dict();
        var i3 = $$$Immutable$Immutable$$Dict({ foo: 10 });

        o = o.set(m1, 1);
        o = o.set(m2, 2);
        o = o.set(i1, 3);
        o = o.set(i2, 4);
        o = o.set(i3, 5);

        $$assert$$assert(o.has(m1));
        $$assert$$assert(o.has(m2));
        $$assert$$assert(o.has(i1));
        $$assert$$assert(o.has(i2));
        $$assert$$assert(o.has(i3));

        $$assert$$assert(o.get(m1) === 1);
        $$assert$$assert(o.get(m2) === 2);
        $$assert$$assert(o.get(i1) === 4);
        $$assert$$assert(o.get(i2) === 4);
        $$assert$$assert(o.get(i3) === 5);

        o = o.remove(m1);
        o = o.remove(m2);
        o = o.remove(i1);
        o = o.remove(i3);

        $$assert$$assert(!o.has(m1));
        $$assert$$assert(!o.has(m2));
        $$assert$$assert(!o.has(i1));
        $$assert$$assert(!o.has(i2));
        $$assert$$assert(!o.has(i3));
      });

      src$Test$Test$$test("=== when not modified", function () {
        $$assert$$assert($$$Immutable$Immutable$$Dict(dict_foo) === dict_foo);
        $$assert$$assert($$$Immutable$Immutable$$SortedDict($$Sorted$$defaultSort, dict_foo) === dict_foo);
        $$assert$$assert($$$Immutable$Immutable$$SortedDict($$Sorted$$simpleSort, dict_foo) !== dict_foo);

        $$assert$$assert(dict_empty.remove("foo") === dict_empty);

        $$assert$$assert(dict_foo.set("foo", 1) === dict_foo);
        $$assert$$assert(dict_foo.set("foo", 2) !== dict_foo);
        $$assert$$assert(dict_foo.set("bar", 3) !== dict_foo);
        $$assert$$assert(dict_foo.remove("foo") !== dict_foo);

        var dict1 = $$$Immutable$Immutable$$Dict().set($$$Immutable$Immutable$$Dict({ foo: 1 }), $$$Immutable$Immutable$$Dict({ bar: 2 }));

        $$assert$$assert(dict1.modify($$$Immutable$Immutable$$Dict({ foo: 1 }), function () {
          return $$$Immutable$Immutable$$Dict({ bar: 2 });
        }) !== dict1);

        $$assert$$assert(dict1.modify($$$Immutable$Immutable$$Dict({ foo: 1 }), function () {
          return $$$Immutable$Immutable$$Dict({ bar: 3 });
        }) !== dict1);

        $$assert$$assert(dict_foo.modify("foo", function () {
          return 1;
        }) === dict_foo);

        $$assert$$assert(dict_foo.modify("foo", function () {
          return 2;
        }) !== dict_foo);

        $$assert$$assert(dict_foo.merge([]) === dict_foo);
        $$assert$$assert(dict_foo.merge([["foo", 1]]) === dict_foo);
        $$assert$$assert(dict_foo.merge([["foo", 2]]) !== dict_foo);
      });

      src$Test$Test$$test("equal", function () {
        $$assert$$assert(!$$$Immutable$Immutable$$equal(dict_empty, dict_foo));
        $$assert$$assert($$$Immutable$Immutable$$equal(dict_empty, dict_empty));
        $$assert$$assert($$$Immutable$Immutable$$equal(dict_foo, dict_foo));
        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Dict(), $$$Immutable$Immutable$$Dict()));
        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Dict({ foo: 1 }), $$$Immutable$Immutable$$Dict({ foo: 1 })));
        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Dict({ foo: $$$Immutable$Immutable$$Dict({ bar: 2 }) }),
                     $$$Immutable$Immutable$$Dict({ foo: $$$Immutable$Immutable$$Dict({ bar: 2 }) })));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Dict({ foo: $$$Immutable$Immutable$$Dict({ bar: 2 }) }),
                      $$$Immutable$Immutable$$Dict({ foo: $$$Immutable$Immutable$$Dict({ bar: 3 }) })));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$SortedDict($$Sorted$$defaultSort, { foo: 1 }),
                     $$$Immutable$Immutable$$Dict({ foo: 1 })));

        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$SortedDict($$Sorted$$simpleSort, { foo: 1 }),
                      $$$Immutable$Immutable$$Dict({ foo: 1 })));
      });

      src$Test$Test$$test("toJS", function () {
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(dict_empty), {}));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(dict_foo), { foo: 1 }));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS($$$Immutable$Immutable$$Dict({ foo: $$$Immutable$Immutable$$Dict({ bar: 2 }) })),
                         { foo: { bar: 2 } }));
      });

      src$Test$Test$$test("random keys", function () {
        var o = $$$Immutable$Immutable$$Dict();
        var js = {};
        src$Test$Test$$verify_dict(o, js);

        src$Test$Test$$random_list(200).forEach(function (i) {
          o = o.set("foo" + i, 5);
          js["foo" + i] = 5;
          src$Test$Test$$verify_dict(o, js);
        });

        src$Test$Test$$random_list(200).forEach(function (i) {
          o = o.modify("foo" + i, function (x) {
            return x + 15;
          });
          js["foo" + i] = js["foo" + i] + 15;
          src$Test$Test$$verify_dict(o, js);
        });

        src$Test$Test$$random_list(200).forEach(function (i) {
          o = o.remove("foo" + i);
          delete js["foo" + i];
          src$Test$Test$$verify_dict(o, js);
        });
      });

      src$Test$Test$$test("forEach", function () {
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Dict, []);

        var corge = $$$Immutable$Immutable$$Dict({ corge: 3 });
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Dict, [["bar", 2], ["foo", 1], ["qux", corge]]);
      });

      src$Test$Test$$test("toString", function () {
        $$assert$$assert("" + $$$Immutable$Immutable$$Dict() === "(Dict)");
        $$assert$$assert("" + $$$Immutable$Immutable$$SortedDict($$Sorted$$defaultSort) === "(Dict)");
        $$assert$$assert("" + $$$Immutable$Immutable$$SortedDict($$Sorted$$simpleSort) === "(SortedDict (Mutable 3))");
        $$assert$$assert("" + $$$Immutable$Immutable$$SortedDict($$Sorted$$simpleSort, { foo: 1 }) === "(SortedDict (Mutable 3)\n  \"foo\" = 1)");
        $$assert$$assert("" + $$$Immutable$Immutable$$SortedDict($$Sorted$$simpleSort, { foo: 1, bar: 2 }) === "(SortedDict (Mutable 3)\n  \"bar\" = 2\n  \"foo\" = 1)");

        $$assert$$assert("" + $$$Immutable$Immutable$$Dict({ foo: 1 }) === "(Dict\n  \"foo\" = 1)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Dict({ foo: 1, bar: 2 }) === "(Dict\n  \"bar\" = 2\n  \"foo\" = 1)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Dict({ "foo\nbar\nqux": 1, bar: 2 }) === "(Dict\n  \"bar\" = 2\n  \"foo\n   bar\n   qux\" = 1)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Dict({ foo: $$$Immutable$Immutable$$Dict({ qux: 3 }), bar: 2 }) === "(Dict\n  \"bar\" = 2\n  \"foo\" = (Dict\n            \"qux\" = 3))");
        $$assert$$assert("" + $$$Immutable$Immutable$$Dict({ "foo\nbar\nqux": $$$Immutable$Immutable$$Dict({ qux: 3 }), bar: 2 }) === "(Dict\n  \"bar\" = 2\n  \"foo\n   bar\n   qux\" = (Dict\n            \"qux\" = 3))");

        $$assert$$assert("" + $$$Immutable$Immutable$$Dict({ foobarquxcorgenou: 1, bar: 2 }) === "(Dict\n  \"bar\"               = 2\n  \"foobarquxcorgenou\" = 1)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Dict({ "foobar\nquxcorgenou": 1, bar: 2 }) === "(Dict\n  \"bar\"         = 2\n  \"foobar\n   quxcorgenou\" = 1)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Dict({ "foo\nbar\nqux": 1, "barquxcorgenou": 2 }) === "(Dict\n  \"barquxcorgenou\" = 2\n  \"foo\n   bar\n   qux\"            = 1)");

        $$assert$$assert("" + $$$Immutable$Immutable$$Dict([[$$$Immutable$Immutable$$Dict({ foo: 1 }), $$$Immutable$Immutable$$Dict({ bar: 2 })]]) === "(Dict\n  (Dict\n    \"foo\" = 1) = (Dict\n                   \"bar\" = 2))");
      });

      // TODO
      /*test("zip", function () {
        var a = [["a", 1], ["b", 2], ["c", 3], ["d", 4],
                 ["e", 5], ["f", 6], ["g", 7], ["h", 8]];
        assert.equal(toArray(zip(Dict(a))), toArray(zip(a)));
      });*/
    });


    src$Test$Test$$context("Set", function () {
      var empty_set = $$$Immutable$Immutable$$Set();
      var five_set  = $$$Immutable$Immutable$$Set().add(1).add(2).add(3).add(4).add(5);

      src$Test$Test$$test("isSet", function () {
        $$assert$$assert(!$$$Immutable$Immutable$$isSet($$$Immutable$Immutable$$Dict()));

        $$assert$$assert($$$Immutable$Immutable$$isSet($$$Immutable$Immutable$$Set()));
        $$assert$$assert($$$Immutable$Immutable$$isSet($$$Immutable$Immutable$$SortedSet($$Sorted$$defaultSort)));

        $$assert$$assert($$$Immutable$Immutable$$isSortedSet($$$Immutable$Immutable$$SortedSet($$Sorted$$simpleSort)));
        $$assert$$assert(!$$$Immutable$Immutable$$isSortedSet($$$Immutable$Immutable$$SortedSet($$Sorted$$defaultSort)));
        $$assert$$assert(!$$$Immutable$Immutable$$isSortedSet($$$Immutable$Immutable$$Set()));
      });

      src$Test$Test$$test("verify", function () {
        src$Test$Test$$verify_set(empty_set, []);
        src$Test$Test$$verify_set(five_set, [1, 2, 3, 4, 5]);
      });

      src$Test$Test$$test("init", function () {
        src$Test$Test$$verify_set($$$Immutable$Immutable$$Set([1, 2, 3]), [1, 2, 3]);
      });

      src$Test$Test$$test("isEmpty", function () {
        $$assert$$assert(empty_set.isEmpty());
        $$assert$$assert(!five_set.isEmpty());
      });

      src$Test$Test$$test("has", function () {
        $$assert$$assert(!empty_set.has(1));
        $$assert$$assert(!five_set.has(0));
        $$assert$$assert(five_set.has(1));
        $$assert$$assert(five_set.has(2));
        $$assert$$assert(five_set.has(3));
        $$assert$$assert(five_set.has(4));
        $$assert$$assert(five_set.has(5));
        $$assert$$assert(!five_set.has(6));
      });

      src$Test$Test$$test("add", function () {
        src$Test$Test$$verify_set(empty_set, []);
        src$Test$Test$$verify_set(empty_set.add(5), [5]);
        src$Test$Test$$verify_set(empty_set, []);

        src$Test$Test$$verify_set(five_set, [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_set(five_set.add(5), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_set(five_set, [1, 2, 3, 4, 5]);
      });

      src$Test$Test$$test("remove", function () {
        src$Test$Test$$verify_set(empty_set.remove(1), []);

        src$Test$Test$$verify_set(five_set.remove(1), [2, 3, 4, 5]);
        src$Test$Test$$verify_set(five_set.remove(1).remove(4), [2, 3, 5]);
      });

      src$Test$Test$$test("union", function () {
        src$Test$Test$$verify_set(five_set.union(five_set), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_set(five_set.union($$$Immutable$Immutable$$Set([1, 2, 6, 9])), [1, 2, 3, 4, 5, 6, 9]);
        src$Test$Test$$verify_set($$$Immutable$Immutable$$Set([1, 2]).union(five_set), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_set($$$Immutable$Immutable$$Set([1, 2, 6]).union(five_set), [1, 2, 3, 4, 5, 6]);
        src$Test$Test$$verify_set(five_set.union([1, 2, 6, 9]), [1, 2, 3, 4, 5, 6, 9]);
      });

      src$Test$Test$$test("intersect", function () {
        src$Test$Test$$verify_set(five_set.intersect(five_set), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_set(empty_set.intersect(five_set), []);
        src$Test$Test$$verify_set(five_set.intersect(empty_set), []);
        src$Test$Test$$verify_set(five_set.intersect([1, 3, 4]), [1, 3, 4]);
        src$Test$Test$$verify_set(five_set.intersect([1, 3, 4, 6, 10, 20]), [1, 3, 4]);
      });

      src$Test$Test$$test("disjoint", function () {
        src$Test$Test$$verify_set(five_set.disjoint(five_set), []);
        src$Test$Test$$verify_set(five_set.disjoint(empty_set), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_set(empty_set.disjoint(five_set), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_set(five_set.disjoint([1, 2, 3]), [4, 5]);
        src$Test$Test$$verify_set(five_set.disjoint([1, 2, 3, 6, 7, 8]), [4, 5, 6, 7, 8]);
      });

      src$Test$Test$$test("subtract", function () {
        src$Test$Test$$verify_set(five_set.subtract(empty_set), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_set(empty_set.subtract(five_set), []);
        src$Test$Test$$verify_set(five_set.subtract(five_set), []);
        src$Test$Test$$verify_set(five_set.subtract([1, 2, 3]), [4, 5]);
        src$Test$Test$$verify_set(five_set.subtract([1, 2, 3, 6, 7, 9]), [4, 5]);
      });

      src$Test$Test$$test("complex elements", function () {
        var o = $$$Immutable$Immutable$$Set();

        var m1 = {};
        var m2 = {};

        var i1 = $$$Immutable$Immutable$$Set();
        var i2 = $$$Immutable$Immutable$$Set();
        var i3 = $$$Immutable$Immutable$$Set([1, 2, 3]);

        o = o.add(m1);
        o = o.add(m2);
        o = o.add(i1);
        o = o.add(i2);
        o = o.add(i3);

        $$assert$$assert(o.has(m1));
        $$assert$$assert(o.has(m2));
        $$assert$$assert(o.has(i1));
        $$assert$$assert(o.has(i2));
        $$assert$$assert(o.has(i3));

        o = o.remove(m1);
        o = o.remove(m2);
        o = o.remove(i1);
        o = o.remove(i3);

        $$assert$$assert(!o.has(m1));
        $$assert$$assert(!o.has(m2));
        $$assert$$assert(!o.has(i1));
        $$assert$$assert(!o.has(i2));
        $$assert$$assert(!o.has(i3));
      });

      src$Test$Test$$test("=== when not modified", function () {
        $$assert$$assert(empty_set.union(empty_set) === empty_set);
        $$assert$$assert(empty_set.union(five_set) !== five_set);
        $$assert$$assert(five_set.union(empty_set) === five_set);
        $$assert$$assert(five_set.union(five_set) === five_set);
        $$assert$$assert(five_set.union($$$Immutable$Immutable$$Set([1, 2, 3])) === five_set);

        $$assert$$assert($$$Immutable$Immutable$$Set(five_set) === five_set);
        $$assert$$assert($$$Immutable$Immutable$$SortedSet($$Sorted$$defaultSort, five_set) === five_set);
        $$assert$$assert($$$Immutable$Immutable$$SortedSet($$Sorted$$simpleSort, five_set) !== five_set);

        $$assert$$assert(empty_set.remove(1) === empty_set);

        var set1 = $$$Immutable$Immutable$$Set([$$$Immutable$Immutable$$Set([])]);

        $$assert$$assert(set1.add($$$Immutable$Immutable$$Set([])) !== set1);

        $$assert$$assert(five_set.add(5) === five_set);
        $$assert$$assert(five_set.add(6) !== five_set);
        $$assert$$assert(five_set.remove(5) !== five_set);
      });

      src$Test$Test$$test("equal", function () {
        $$assert$$assert(!$$$Immutable$Immutable$$equal(empty_set, five_set));
        $$assert$$assert($$$Immutable$Immutable$$equal(empty_set, empty_set));
        $$assert$$assert($$$Immutable$Immutable$$equal(five_set, five_set));
        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Set(), $$$Immutable$Immutable$$Set()));
        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Set([1]), $$$Immutable$Immutable$$Set([1])));
        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Set([$$$Immutable$Immutable$$Set([1])]), $$$Immutable$Immutable$$Set([$$$Immutable$Immutable$$Set([1])])));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Set([$$$Immutable$Immutable$$Set([1])]), $$$Immutable$Immutable$$Set([$$$Immutable$Immutable$$Set([2])])));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$SortedSet($$Sorted$$defaultSort, [1, 2, 3]),
                     $$$Immutable$Immutable$$Set([1, 2, 3])));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$SortedSet($$Sorted$$simpleSort, [1, 2, 3]),
                      $$$Immutable$Immutable$$Set([1, 2, 3])));
      });

      src$Test$Test$$test("toJS", function () {
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(empty_set), []));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(five_set), [1, 2, 3, 4, 5]));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS($$$Immutable$Immutable$$Set([1, 2, $$$Immutable$Immutable$$Set([3])])),
                         [[3], 1, 2]));
      });

      src$Test$Test$$test("random elements", function () {
        var o = $$$Immutable$Immutable$$Set();
        var a = [];

        var sort = o.sort;

        // TODO utilities for these
        function push_sorted(a, x, sort) {
          for (var i = 0, l = a.length; i < l; ++i) {
            if (sort(x, a[i]) <= 0) {
              a.splice(i, 0, x);
              return;
            }
          }
          a.push(x);
        }

        function remove(a, x) {
          var index = a.indexOf(x);
          $$assert$$assert(index !== -1);
          a.splice(index, 1);
        }

        src$Test$Test$$verify_set(o, a);

        src$Test$Test$$random_list(200).forEach(function (i) {
          o = o.add(i);
          push_sorted(a, i, sort);
          src$Test$Test$$verify_set(o, a);
        });

        src$Test$Test$$random_list(200).forEach(function (i) {
          o = o.remove(i);
          remove(a, i);
          src$Test$Test$$verify_set(o, a);
        });

        src$Test$Test$$verify_set(o, []);
      });

      src$Test$Test$$test("forEach", function () {
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Set, []);

        var four = $$$Immutable$Immutable$$Set([4]);
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Set, [four, 1, 2, 3]);
      });

      src$Test$Test$$test("toString", function () {
        $$assert$$assert("" + $$$Immutable$Immutable$$Set() === "(Set)");
        $$assert$$assert("" + $$$Immutable$Immutable$$SortedSet($$Sorted$$defaultSort) === "(Set)");
        $$assert$$assert("" + $$$Immutable$Immutable$$SortedSet($$Sorted$$simpleSort) === "(SortedSet (Mutable 3))");
        $$assert$$assert("" + $$$Immutable$Immutable$$Set([1, 2, 3, 4, 5]) === "(Set\n  1\n  2\n  3\n  4\n  5)");
        $$assert$$assert("" + $$$Immutable$Immutable$$SortedSet($$Sorted$$simpleSort, [1, 2, 3, 4, 5]) === "(SortedSet (Mutable 3)\n  1\n  2\n  3\n  4\n  5)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Set([$$$Immutable$Immutable$$Set([1, 2, 3])]) === "(Set\n  (Set\n    1\n    2\n    3))");
      });

      // TODO
      /*test("zip", function () {
        var a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        assert.equal(toArray(zip(Set(a))), toArray(zip(a)));
      });*/
    });


    src$Test$Test$$context("List", function () {
      var empty_list = $$$Immutable$Immutable$$List();
      var five_list  = $$$Immutable$Immutable$$List().insert(1).insert(2).insert(3).insert(4).insert(5);

      src$Test$Test$$test("isList", function () {
        $$assert$$assert(!$$$Immutable$Immutable$$isList($$$Immutable$Immutable$$Dict()));
        $$assert$$assert($$$Immutable$Immutable$$isList($$$Immutable$Immutable$$List()));
      });

      src$Test$Test$$test("verify", function () {
        src$Test$Test$$verify_list(empty_list, []);
        src$Test$Test$$verify_list(five_list, [1, 2, 3, 4, 5]);
      });

      src$Test$Test$$test("init", function () {
        src$Test$Test$$verify_list($$$Immutable$Immutable$$List([1, 2, 3]), [1, 2, 3]);
      });

      src$Test$Test$$test("isEmpty", function () {
        $$assert$$assert(empty_list.isEmpty());
        $$assert$$assert(!five_list.isEmpty());
      });

      src$Test$Test$$test("size", function () {
        $$assert$$assert(empty_list.size() === 0);
        $$assert$$assert(five_list.size() === 5);
      });

      src$Test$Test$$test("has", function () {
        $$assert$$assert(!empty_list.has(0));
        $$assert$$assert(!empty_list.has(-1));

        $$assert$$assert(five_list.has(0));
        $$assert$$assert(five_list.has(4));
        $$assert$$assert(five_list.has(-1));
        $$assert$$assert(five_list.has(-5));
        $$assert$$assert(!five_list.has(5));
        $$assert$$assert(!five_list.has(-6));
      });

      src$Test$Test$$test("get", function () {
        $$assert$$assert(empty_list.get(0, 50) === 50);
        $$assert$$assert(empty_list.get(-1, 50) === 50);

        src$Test$Test$$assert_raises(function () {
          empty_list.get(0);
        }, "Index 0 is not valid");

        src$Test$Test$$assert_raises(function () {
          empty_list.get(-1);
        }, "Index -1 is not valid");

        $$assert$$assert(empty_list.get(0, 50) === 50);

        $$assert$$assert(five_list.get(0, 50) === 1);
        $$assert$$assert(five_list.get(4, 50) === 5);
        $$assert$$assert(five_list.get(-1, 50) === 5);
        $$assert$$assert(five_list.get(-2, 50) === 4);
      });

      src$Test$Test$$test("insert", function () {
        src$Test$Test$$assert_raises(function () {
          empty_list.insert(5, 1);
        }, "Index 1 is not valid");

        src$Test$Test$$assert_raises(function () {
          empty_list.insert(5, -2);
        }, "Index -1 is not valid");

        var x = empty_list.insert(10);

        src$Test$Test$$verify_list(empty_list, []);
        src$Test$Test$$verify_list(x, [10]);

        $$assert$$assert(empty_list.size() === 0);
        $$assert$$assert(x.size() === 1);
        $$assert$$assert(x.get(0) === 10);
        $$assert$$assert(x.get(-1) === 10);

        src$Test$Test$$verify_list(five_list.insert(10), [1, 2, 3, 4, 5, 10]);
        src$Test$Test$$verify_list(five_list.insert(10).insert(20), [1, 2, 3, 4, 5, 10, 20]);
        src$Test$Test$$verify_list(five_list.insert(10, 0), [10, 1, 2, 3, 4, 5]);
        src$Test$Test$$verify_list(five_list.insert(10, 1), [1, 10, 2, 3, 4, 5]);
        src$Test$Test$$verify_list(five_list.insert(10, -1), [1, 2, 3, 4, 5, 10]);
        src$Test$Test$$verify_list(five_list.insert(10, -2), [1, 2, 3, 4, 10, 5]);
        src$Test$Test$$verify_list(five_list, [1, 2, 3, 4, 5]);

        src$Test$Test$$verify_list($$$Immutable$Immutable$$List().insert(5, 0).insert(4, 0).insert(3, 0).insert(2, 0).insert(1, 0),
                    [1, 2, 3, 4, 5]);
      });

      src$Test$Test$$test("remove", function () {
        src$Test$Test$$assert_raises(function () {
          empty_list.remove();
        }, "Index -1 is not valid");

        src$Test$Test$$assert_raises(function () {
          empty_list.remove(0);
        }, "Index 0 is not valid");

        src$Test$Test$$assert_raises(function () {
          empty_list.remove(-1);
        }, "Index -1 is not valid");

        src$Test$Test$$verify_list(five_list.remove(), [1, 2, 3, 4]);
        src$Test$Test$$verify_list(five_list.remove().remove(), [1, 2, 3]);
        src$Test$Test$$verify_list(five_list.remove(-1), [1, 2, 3, 4]);
        src$Test$Test$$verify_list(five_list.remove(-2), [1, 2, 3, 5]);
        src$Test$Test$$verify_list(five_list.remove(0), [2, 3, 4, 5]);
        src$Test$Test$$verify_list(five_list.remove(1), [1, 3, 4, 5]);
      });

      src$Test$Test$$test("modify", function () {
        var ran = false;

        src$Test$Test$$assert_raises(function () {
          empty_list.modify(0, function () { ran = true; });
        }, "Index 0 is not valid");

        src$Test$Test$$assert_raises(function () {
          empty_list.modify(-1, function () { ran = true; });
        }, "Index -1 is not valid");

        $$assert$$assert(ran === false);


        var ran = false;

        src$Test$Test$$verify_list(five_list.modify(0, function (x) {
          ran = true;
          $$assert$$assert(x === 1);
          return x + 100;
        }), [101, 2, 3, 4, 5]);

        $$assert$$assert(ran === true);


        src$Test$Test$$verify_list(five_list.modify(-1, function (x) { return x + 100 }), [1, 2, 3, 4, 105]);
        src$Test$Test$$verify_list(five_list.modify(1, function (x) { return x + 100 }), [1, 102, 3, 4, 5]);
        src$Test$Test$$verify_list(five_list.modify(-2, function (x) { return x + 100 }), [1, 2, 3, 104, 5]);
      });

      src$Test$Test$$test("slice", function () {
        src$Test$Test$$verify_list(empty_list.slice(0, 0), []);
        src$Test$Test$$verify_list(five_list.slice(0, 0), []);
        src$Test$Test$$verify_list(five_list.slice(0, 2), [1, 2]);
        src$Test$Test$$verify_list(five_list.slice(2, 3), [3]);
        src$Test$Test$$verify_list(five_list.slice(3, 5), [4, 5]);
        src$Test$Test$$verify_list(five_list.slice(0, 5), [1, 2, 3, 4, 5]);

        src$Test$Test$$verify_list(empty_list.slice(), []);

        src$Test$Test$$assert_raises(function () {
          five_list.slice(5, 1);
        }, "Index 5 is greater than index 1");

        src$Test$Test$$assert_raises(function () {
          five_list.slice(6, 7);
        }, "Index 6 is not valid");

        src$Test$Test$$assert_raises(function () {
          five_list.slice(0, 6);
        }, "Index 6 is not valid");

        src$Test$Test$$assert_raises(function () {
          five_list.slice(10, 10);
        }, "Index 10 is not valid");

        src$Test$Test$$verify_list(five_list.slice(null, 5), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_list(five_list.slice(0, null), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_list(five_list.slice(null, null), [1, 2, 3, 4, 5]);

        src$Test$Test$$verify_list(five_list.slice(), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_list(five_list.slice(0), [1, 2, 3, 4, 5]);
        src$Test$Test$$verify_list(five_list.slice(-1), [5]);
        src$Test$Test$$verify_list(five_list.slice(-3), [3, 4, 5]);
        src$Test$Test$$verify_list(five_list.slice(-3, 4), [3, 4]);

        src$Test$Test$$verify_list(five_list.slice(0, -1), [1, 2, 3, 4]);
        src$Test$Test$$verify_list(five_list.slice(-2, -1), [4]);
        src$Test$Test$$verify_list(five_list.slice(-4, -1), [2, 3, 4]);
        src$Test$Test$$verify_list(five_list.slice(-4, 4), [2, 3, 4]);


        var double_list  = $$$Immutable$Immutable$$List();
        var double_array = [];

        var len = 125 * 2;
        for (var i = 0; i < len; ++i) {
          double_list = double_list.insert(i);
          double_array.push(i);
        }

        src$Test$Test$$verify_list(double_list.slice(0, 124), double_array.slice(0, 124));
        src$Test$Test$$verify_list(double_list.slice(0, 125), double_array.slice(0, 125));
        src$Test$Test$$verify_list(double_list.slice(0, 126), double_array.slice(0, 126));

        src$Test$Test$$verify_list(double_list.slice(124, 250), double_array.slice(124, 250));
        src$Test$Test$$verify_list(double_list.slice(125, 250), double_array.slice(125, 250));
        src$Test$Test$$verify_list(double_list.slice(126, 250), double_array.slice(126, 250));

        src$Test$Test$$verify_list(double_list.slice(124, 125), double_array.slice(124, 125));
        src$Test$Test$$verify_list(double_list.slice(125, 126), double_array.slice(125, 126));

        src$Test$Test$$verify_list(double_list.slice(0, 250), double_array.slice(0, 250));


        var big_list  = $$$Immutable$Immutable$$List();
        var big_array = [];

        var len = 125 * 1000;
        for (var i = 0; i < len; ++i) {
          big_list = big_list.insert(i);
          big_array.push(i);
        }

        src$Test$Test$$verify_list(big_list.slice(0, 125), big_array.slice(0, 125));
        src$Test$Test$$verify_list(big_list.slice(0, 126), big_array.slice(0, 126));
        src$Test$Test$$verify_list(big_list.slice(125, 250), big_array.slice(125, 250));
        src$Test$Test$$verify_list(big_list.slice(50, 125), big_array.slice(50, 125));
        src$Test$Test$$verify_list(big_list.slice(50, 126), big_array.slice(50, 126));
        src$Test$Test$$verify_list(big_list.slice(50, 2546), big_array.slice(50, 2546));

        src$Test$Test$$verify_list(big_list.slice(0, len), big_array.slice(0, len));
        src$Test$Test$$verify_list(big_list.slice(0, len - 1), big_array.slice(0, len - 1));
        src$Test$Test$$verify_list(big_list.slice(1, len), big_array.slice(1, len));
        src$Test$Test$$verify_list(big_list.slice(1, len - 1), big_array.slice(1, len - 1));
        src$Test$Test$$verify_list(big_list.slice(50, 60), big_array.slice(50, 60));
        src$Test$Test$$verify_list(big_list.slice(50, 125), big_array.slice(50, 125));
        src$Test$Test$$verify_list(big_list.slice(50, 126), big_array.slice(50, 126));
        src$Test$Test$$verify_list(big_list.slice(125, 126), big_array.slice(125, 126));
        src$Test$Test$$verify_list(big_list.slice(124, 126), big_array.slice(124, 126));
        src$Test$Test$$verify_list(big_list.slice(Math.ceil(len / 2)), big_array.slice(Math.ceil(len / 2)));
      });

      src$Test$Test$$test("concat", function () {
        src$Test$Test$$verify_list(empty_list.concat(empty_list), []);
        src$Test$Test$$verify_list(five_list.concat(five_list), [1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
        src$Test$Test$$verify_list($$$Immutable$Immutable$$List([10, 20, 30]).concat(five_list), [10, 20, 30, 1, 2, 3, 4, 5]);
        src$Test$Test$$verify_list(five_list.concat($$$Immutable$Immutable$$List([10, 20, 30])), [1, 2, 3, 4, 5, 10, 20, 30]);
        src$Test$Test$$verify_list(five_list.concat([10, 20, 30]), [1, 2, 3, 4, 5, 10, 20, 30]);
      });

      src$Test$Test$$test("=== when not modified", function () {
        $$assert$$assert($$$Immutable$Immutable$$List(five_list) === five_list);

        $$assert$$assert(empty_list.concat(empty_list) === empty_list);
        $$assert$$assert(five_list.concat(empty_list) === five_list);
        $$assert$$assert(empty_list.concat(five_list) === five_list);

        $$assert$$assert(empty_list.slice() === empty_list);
        $$assert$$assert(five_list.slice() === five_list);
        $$assert$$assert(five_list.slice(0, 5) === five_list);
        $$assert$$assert(five_list.slice(1, 5) !== five_list);
        $$assert$$assert(five_list.slice(0, 4) !== five_list);

        var list1 = $$$Immutable$Immutable$$List([$$$Immutable$Immutable$$List([])]);

        $$assert$$assert(list1.modify(0, function () {
          return $$$Immutable$Immutable$$List([]);
        }) !== list1);

        $$assert$$assert(five_list.modify(0, function () {
          return 1;
        }) === five_list);

        $$assert$$assert(five_list.modify(0, function () {
          return 2;
        }) !== five_list);

        $$assert$$assert(five_list.modify(1, function () {
          return 2;
        }) === five_list);

        $$assert$$assert(five_list.modify(1, function () {
          return 3;
        }) !== five_list);

        $$assert$$assert(five_list.modify(-1, function () {
          return 5;
        }) === five_list);

        $$assert$$assert(five_list.modify(-1, function () {
          return 6;
        }) !== five_list);
      });

      src$Test$Test$$test("equal", function () {
        $$assert$$assert($$$Immutable$Immutable$$equal(empty_list, empty_list));
        $$assert$$assert($$$Immutable$Immutable$$equal(five_list, five_list));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$List([1, 2, 3]), $$$Immutable$Immutable$$List([1, 2, 3])));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$List([1, 2, 3]), $$$Immutable$Immutable$$List([1, 2, 4])));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$List([1, 2, 3]), $$$Immutable$Immutable$$List([1, 3, 2])));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$List([1, 2, 3, 4, 5]), five_list));
        $$assert$$assert($$$Immutable$Immutable$$equal(five_list, $$$Immutable$Immutable$$List([1, 2, 3, 4, 5])));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$List([$$$Immutable$Immutable$$List([1, 2, 3])]), $$$Immutable$Immutable$$List([$$$Immutable$Immutable$$List([1, 2, 3])])));
      });

      src$Test$Test$$test("toJS", function () {
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(empty_list), []));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(five_list), [1, 2, 3, 4, 5]));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS($$$Immutable$Immutable$$List([1, 2, $$$Immutable$Immutable$$List([3])])), [1, 2, [3]]));
      });

      src$Test$Test$$test("random elements", function () {
        var o = $$$Immutable$Immutable$$List();
        var a = [];

        src$Test$Test$$verify_list(o, a);

        src$Test$Test$$random_list(200).forEach(function (x) {
          var index = src$Test$Test$$random_int(o.size());

          o = o.insert(x, index);
          a.splice(index, 0, x);

          src$Test$Test$$verify_list(o, a);
        });

        src$Test$Test$$random_list(200).forEach(function (i) {
          o = o.modify(i, function (x) {
            return x + 15;
          });

          a[i] = a[i] + 15;

          src$Test$Test$$verify_list(o, a);
        });

        while (o.size()) {
          var index = src$Test$Test$$random_int(o.size());
          o = o.remove(index);
          a.splice(index, 1);
          src$Test$Test$$verify_list(o, a);
        }

        $$assert$$assert(o.isEmpty());
        src$Test$Test$$verify_list(o, []);


        var a = src$Test$Test$$random_list(200);
        var pivot = src$Test$Test$$random_int(200);

        function test_concat(pivot) {
          var al = [];
          var ar = [];

          var il = $$$Immutable$Immutable$$List();
          var ir = $$$Immutable$Immutable$$List();

          a.slice(0, pivot).forEach(function (x) {
            var index = src$Test$Test$$random_int(il.size());
            il = il.insert(x, index);
            al.splice(index, 0, x);
            src$Test$Test$$verify_list(il, al);
          });

          a.slice(pivot).forEach(function (x) {
            var index = src$Test$Test$$random_int(ir.size());
            ir = ir.insert(x, index);
            ar.splice(index, 0, x);
            src$Test$Test$$verify_list(ir, ar);
          });

          src$Test$Test$$verify_list(il.concat(ir), al.concat(ar));
          src$Test$Test$$verify_list(ir.concat(il), ar.concat(al));
        }

        test_concat(0);
        test_concat(5);
        test_concat(pivot);
        test_concat(194);
        test_concat(199);
      });

      src$Test$Test$$test("forEach", function () {
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$List, []);

        var list = $$$Immutable$Immutable$$List([4]);
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$List, [1, 2, 3, list]);

        var expected = src$Test$Test$$random_list(200);
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$List, expected);
      });

      src$Test$Test$$test("toString", function () {
        $$assert$$assert("" + empty_list === "(List)");
        $$assert$$assert("" + $$$Immutable$Immutable$$List([1, 2, 3]) === "(List\n  1\n  2\n  3)");
        $$assert$$assert("" + $$$Immutable$Immutable$$List([1, $$$Immutable$Immutable$$List([2]), 3]) === "(List\n  1\n  (List\n    2)\n  3)");
      });

      // TODO
      /*test("zip", function () {
        assert.equal(toArray(zip(List())), toArray(zip([])));

        assert.equal(toArray(zip(List([1, 2, 3, 4, 5]))), [[1], [2], [3], [4], [5]]);

        var a = random_list(200);
        assert.equal(toArray(zip(List(a))), toArray(zip(a)));
      });*/
    });


    src$Test$Test$$context("Queue", function () {
      var empty_queue = $$$Immutable$Immutable$$Queue();
      var five_queue  = $$$Immutable$Immutable$$Queue().push(1).push(2).push(3).push(4).push(5);

      src$Test$Test$$test("isQueue", function () {
        $$assert$$assert(!$$$Immutable$Immutable$$isQueue($$$Immutable$Immutable$$List()));
        $$assert$$assert($$$Immutable$Immutable$$isQueue($$$Immutable$Immutable$$Queue()));
      });

      src$Test$Test$$test("verify", function () {
        src$Test$Test$$verify_queue(empty_queue, []);
        src$Test$Test$$verify_queue(five_queue, [1, 2, 3, 4, 5]);
      });

      src$Test$Test$$test("init", function () {
        src$Test$Test$$verify_queue($$$Immutable$Immutable$$Queue([1, 2, 3]), [1, 2, 3]);
      });

      src$Test$Test$$test("isEmpty", function () {
        $$assert$$assert(empty_queue.isEmpty());
        $$assert$$assert(!five_queue.isEmpty());
      });

      src$Test$Test$$test("size", function () {
        $$assert$$assert(empty_queue.size() === 0);
        $$assert$$assert(five_queue.size() === 5);
      });

      src$Test$Test$$test("peek", function () {
        src$Test$Test$$assert_raises(function () {
          empty_queue.peek();
        }, "Cannot peek from an empty queue");

        $$assert$$assert(empty_queue.peek(50) === 50);

        $$assert$$assert(five_queue.peek() === 1);
        $$assert$$assert(five_queue.peek(50) === 1);
      });

      src$Test$Test$$test("push", function () {
        var x = empty_queue.push(10);

        src$Test$Test$$verify_queue(empty_queue, []);
        src$Test$Test$$verify_queue(x, [10]);

        $$assert$$assert(empty_queue.size() === 0);
        $$assert$$assert(x.size() === 1);
        $$assert$$assert(x.peek() === 10);

        src$Test$Test$$verify_queue(five_queue.push(10), [1, 2, 3, 4, 5, 10]);
        src$Test$Test$$verify_queue(five_queue.push(10).push(20), [1, 2, 3, 4, 5, 10, 20]);
        src$Test$Test$$verify_queue(five_queue, [1, 2, 3, 4, 5]);

        src$Test$Test$$verify_queue($$$Immutable$Immutable$$Queue().push(5).push(4).push(3).push(2).push(1),
                     [5, 4, 3, 2, 1]);
      });

      src$Test$Test$$test("pop", function () {
        src$Test$Test$$assert_raises(function () {
          empty_queue.pop();
        }, "Cannot pop from an empty queue");

        src$Test$Test$$verify_queue(five_queue.pop(), [2, 3, 4, 5]);
        src$Test$Test$$verify_queue(five_queue.pop().pop(), [3, 4, 5]);

        src$Test$Test$$verify_queue($$$Immutable$Immutable$$Queue(), []);
        src$Test$Test$$verify_queue($$$Immutable$Immutable$$Queue().push(5).push(10).push(20).push(30), [5, 10, 20, 30]);
        src$Test$Test$$verify_queue($$$Immutable$Immutable$$Queue().push(5).push(10).push(20).push(30).pop(), [10, 20, 30]);
      });

      src$Test$Test$$test("concat", function () {
        src$Test$Test$$verify_queue(empty_queue.concat(empty_queue), []);
        src$Test$Test$$verify_queue(five_queue.concat(five_queue), [1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
        src$Test$Test$$verify_queue($$$Immutable$Immutable$$Queue([10, 20, 30]).concat(five_queue), [10, 20, 30, 1, 2, 3, 4, 5]);
        src$Test$Test$$verify_queue(five_queue.concat($$$Immutable$Immutable$$Queue([10, 20, 30])), [1, 2, 3, 4, 5, 10, 20, 30]);
        src$Test$Test$$verify_queue(five_queue.concat([10, 20, 30]), [1, 2, 3, 4, 5, 10, 20, 30]);
      });

      src$Test$Test$$test("=== when not modified", function () {
        $$assert$$assert($$$Immutable$Immutable$$Queue(five_queue) === five_queue);

        $$assert$$assert(empty_queue.concat(empty_queue) === empty_queue);
        $$assert$$assert(five_queue.concat(empty_queue) === five_queue);
        $$assert$$assert(empty_queue.concat(five_queue) !== five_queue);
      });

      src$Test$Test$$test("equal", function () {
        $$assert$$assert($$$Immutable$Immutable$$equal(empty_queue, empty_queue));
        $$assert$$assert($$$Immutable$Immutable$$equal(five_queue, five_queue));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Queue([1, 2, 3]), $$$Immutable$Immutable$$Queue([1, 2, 3])));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Queue([1, 2, 3]), $$$Immutable$Immutable$$Queue([1, 2, 4])));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Queue([1, 2, 3]), $$$Immutable$Immutable$$Queue([1, 3, 2])));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Queue([1, 2, 3, 4, 5]), five_queue));
        $$assert$$assert($$$Immutable$Immutable$$equal(five_queue, $$$Immutable$Immutable$$Queue([1, 2, 3, 4, 5])));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Queue([$$$Immutable$Immutable$$Queue([1, 2, 3])]), $$$Immutable$Immutable$$Queue([$$$Immutable$Immutable$$Queue([1, 2, 3])])));
      });

      src$Test$Test$$test("toJS", function () {
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(empty_queue), []));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(five_queue), [1, 2, 3, 4, 5]));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS($$$Immutable$Immutable$$Queue([1, 2, $$$Immutable$Immutable$$Queue([3])])), [1, 2, [3]]));
      });

      src$Test$Test$$test("forEach", function () {
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Queue, []);

        var x = $$$Immutable$Immutable$$Queue([3]);
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Queue, [1, 2, x, 4]);
      });

      src$Test$Test$$test("toString", function () {
        $$assert$$assert("" + empty_queue === "(Queue)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Queue([1, 2, 3]) === "(Queue\n  1\n  2\n  3)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Queue([1, $$$Immutable$Immutable$$Queue([2]), 3]) === "(Queue\n  1\n  (Queue\n    2)\n  3)");
      });

      // TODO
      /*test("zip", function () {
        var a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        assert.equal(toArray(zip(Queue(a))), toArray(zip(a)));
      });*/
    });


    src$Test$Test$$context("Stack", function () {
      var empty_stack = $$$Immutable$Immutable$$Stack();
      var five_stack  = $$$Immutable$Immutable$$Stack().push(1).push(2).push(3).push(4).push(5);

      src$Test$Test$$test("isStack", function () {
        $$assert$$assert(!$$$Immutable$Immutable$$isStack($$$Immutable$Immutable$$Queue()));
        $$assert$$assert($$$Immutable$Immutable$$isStack($$$Immutable$Immutable$$Stack()));
      });

      src$Test$Test$$test("verify", function () {
        src$Test$Test$$verify_stack(empty_stack, []);
        src$Test$Test$$verify_stack(five_stack, [1, 2, 3, 4, 5]);
      });

      src$Test$Test$$test("init", function () {
        src$Test$Test$$verify_stack($$$Immutable$Immutable$$Stack([1, 2, 3]), [1, 2, 3]);
      });

      src$Test$Test$$test("isEmpty", function () {
        $$assert$$assert(empty_stack.isEmpty());
        $$assert$$assert(!five_stack.isEmpty());
      });

      src$Test$Test$$test("size", function () {
        $$assert$$assert(empty_stack.size() === 0);
        $$assert$$assert(five_stack.size() === 5);
      });

      src$Test$Test$$test("peek", function () {
        src$Test$Test$$assert_raises(function () {
          empty_stack.peek();
        }, "Cannot peek from an empty stack");

        $$assert$$assert(empty_stack.peek(50) === 50);

        $$assert$$assert(five_stack.peek() === 5);
        $$assert$$assert(five_stack.peek(50) === 5);
      });

      src$Test$Test$$test("push", function () {
        var x = empty_stack.push(10);

        src$Test$Test$$verify_stack(empty_stack, []);
        src$Test$Test$$verify_stack(x, [10]);

        $$assert$$assert(empty_stack.size() === 0);
        $$assert$$assert(x.size() === 1);
        $$assert$$assert(x.peek() === 10);

        src$Test$Test$$verify_stack(five_stack.push(10), [1, 2, 3, 4, 5, 10]);
        src$Test$Test$$verify_stack(five_stack.push(10).push(20), [1, 2, 3, 4, 5, 10, 20]);
        src$Test$Test$$verify_stack(five_stack, [1, 2, 3, 4, 5]);

        src$Test$Test$$verify_stack($$$Immutable$Immutable$$Stack().push(5).push(4).push(3).push(2).push(1),
                     [5, 4, 3, 2, 1]);
      });

      src$Test$Test$$test("pop", function () {
        src$Test$Test$$assert_raises(function () {
          empty_stack.pop();
        }, "Cannot pop from an empty stack");

        src$Test$Test$$verify_stack(five_stack.pop(), [1, 2, 3, 4]);
        src$Test$Test$$verify_stack(five_stack.pop().pop(), [1, 2, 3]);
      });

      src$Test$Test$$test("concat", function () {
        src$Test$Test$$verify_stack(empty_stack.concat(empty_stack), []);
        src$Test$Test$$verify_stack(five_stack.concat(five_stack), [1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
        src$Test$Test$$verify_stack($$$Immutable$Immutable$$Stack([10, 20, 30]).concat(five_stack), [10, 20, 30, 1, 2, 3, 4, 5]);
        src$Test$Test$$verify_stack(five_stack.concat($$$Immutable$Immutable$$Stack([10, 20, 30])), [1, 2, 3, 4, 5, 10, 20, 30]);
        src$Test$Test$$verify_stack(five_stack.concat([10, 20, 30]), [1, 2, 3, 4, 5, 10, 20, 30]);
      });

      src$Test$Test$$test("=== when not modified", function () {
        $$assert$$assert($$$Immutable$Immutable$$Stack(five_stack) === five_stack);

        $$assert$$assert(empty_stack.concat(empty_stack) === empty_stack);
        $$assert$$assert(five_stack.concat(empty_stack) === five_stack);
        $$assert$$assert(empty_stack.concat(five_stack) !== five_stack);
      });

      src$Test$Test$$test("equal", function () {
        $$assert$$assert($$$Immutable$Immutable$$equal(empty_stack, empty_stack));
        $$assert$$assert($$$Immutable$Immutable$$equal(five_stack, five_stack));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Stack([1, 2, 3]), $$$Immutable$Immutable$$Stack([1, 2, 3])));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Stack([1, 2, 3]), $$$Immutable$Immutable$$Stack([1, 2, 4])));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Stack([1, 2, 3]), $$$Immutable$Immutable$$Stack([1, 3, 2])));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Stack([1, 2, 3, 4, 5]), five_stack));
        $$assert$$assert($$$Immutable$Immutable$$equal(five_stack, $$$Immutable$Immutable$$Stack([1, 2, 3, 4, 5])));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Stack([$$$Immutable$Immutable$$Stack([1, 2, 3])]), $$$Immutable$Immutable$$Stack([$$$Immutable$Immutable$$Stack([1, 2, 3])])));
      });

      src$Test$Test$$test("toJS", function () {
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(empty_stack), []));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(five_stack), [1, 2, 3, 4, 5]));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS($$$Immutable$Immutable$$Stack([1, 2, $$$Immutable$Immutable$$Stack([3])])), [1, 2, [3]]));
      });

      src$Test$Test$$test("forEach", function () {
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Stack, []);

        var x = $$$Immutable$Immutable$$Stack([3]);
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Stack, [1, 2, x, 4]);
      });

      src$Test$Test$$test("toString", function () {
        $$assert$$assert("" + empty_stack === "(Stack)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Stack([1, 2, 3]) === "(Stack\n  1\n  2\n  3)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Stack([1, $$$Immutable$Immutable$$Stack([2]), 3]) === "(Stack\n  1\n  (Stack\n    2)\n  3)");
      });

      // TODO
      /*test("zip", function () {
        var a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        assert.equal(toArray(zip(Stack(a))), toArray(zip(a)));
      });*/
    });


    src$Test$Test$$context("Record", function () {
      var Empty = $$$Immutable$Immutable$$Record({});
      var Foo   = $$$Immutable$Immutable$$Record({ foo: 1 });

      src$Test$Test$$test("isRecord", function () {
        $$assert$$assert(!$$$Immutable$Immutable$$isRecord($$$Immutable$Immutable$$Dict()));
        $$assert$$assert($$$Immutable$Immutable$$isRecord(Empty));
        $$assert$$assert($$$Immutable$Immutable$$isRecord(Foo));
      });

      src$Test$Test$$test("verify", function () {
        src$Test$Test$$verify_record(Empty, {});
        src$Test$Test$$verify_record(Foo, { foo: 1 });
      });

      src$Test$Test$$test("toString", function () {
        $$assert$$assert("" + Empty === "(Record)");
        $$assert$$assert("" + Foo === "(Record\n  \"foo\" = 1)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Record({ foo: 2 }) === "(Record\n  \"foo\" = 2)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Record({ foo: 1 }) === "(Record\n  \"foo\" = 1)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Record({ foo: 1, bar: 2 }) === "(Record\n  \"foo\" = 1\n  \"bar\" = 2)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Record({ "foo\nbar\nqux": 1, bar: 2 }) === "(Record\n  \"foo\n   bar\n   qux\" = 1\n  \"bar\" = 2)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Record({ foo: $$$Immutable$Immutable$$Record({ qux: 3 }), bar: 2 }) === "(Record\n  \"foo\" = (Record\n            \"qux\" = 3)\n  \"bar\" = 2)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Record({ "foo\nbar\nqux": $$$Immutable$Immutable$$Record({ qux: 3 }), bar: 2 }) === "(Record\n  \"foo\n   bar\n   qux\" = (Record\n            \"qux\" = 3)\n  \"bar\" = 2)");

        $$assert$$assert("" + $$$Immutable$Immutable$$Record({ foobarquxcorgenou: 1, bar: 2 }) === "(Record\n  \"foobarquxcorgenou\" = 1\n  \"bar\"               = 2)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Record({ "foobar\nquxcorgenou": 1, bar: 2 }) === "(Record\n  \"foobar\n   quxcorgenou\" = 1\n  \"bar\"         = 2)");
        $$assert$$assert("" + $$$Immutable$Immutable$$Record({ "foo\nbar\nqux": 1, "barquxcorgenou": 2 }) === "(Record\n  \"foo\n   bar\n   qux\"            = 1\n  \"barquxcorgenou\" = 2)");
      });

      src$Test$Test$$test("init", function () {
        var x = $$$Immutable$Immutable$$Record({ foo: 1 });
        src$Test$Test$$verify_record(x, { foo: 1 });
        $$assert$$assert($$$Immutable$Immutable$$equal(x, Foo));
        $$assert$$assert($$$Immutable$Immutable$$equal(Foo, x));

        src$Test$Test$$verify_record($$$Immutable$Immutable$$Record({ foo: 2 }), { foo: 2 });

        src$Test$Test$$verify_record($$$Immutable$Immutable$$Record(), {});
      });

      src$Test$Test$$test("get", function () {
        src$Test$Test$$assert_raises(function () {
          Empty.get("foo");
        }, "Key foo not found");

        $$assert$$assert(Foo.get("foo") === 1);
      });

      src$Test$Test$$test("set", function () {
        src$Test$Test$$assert_raises(function () {
          Empty.set("bar", 2);
        }, "Key bar not found");

        var x  = Foo;
        var x2 = x.set("foo", 3);
        $$assert$$assert(x.get("foo") === 1);
        $$assert$$assert(x2.get("foo") === 3);
      });

      src$Test$Test$$test("modify", function () {
        var ran = false;

        src$Test$Test$$assert_raises(function () {
          Empty.modify("foo", function (x) {
            ran = true;
            return x + 1;
          });
        }, "Key foo not found");

        $$assert$$assert(ran === false);


        var ran = false;

        var x  = Foo;
        var x2 = x.modify("foo", function (x) {
          ran = true;
          $$assert$$assert(x === 1);
          return x + 5;
        });

        $$assert$$assert(ran === true);

        $$assert$$assert(x.get("foo") === 1);
        $$assert$$assert(x2.get("foo") === 6);
      });

      src$Test$Test$$test("update", function () {
        src$Test$Test$$verify_record($$$Immutable$Immutable$$Record({ foo: 1 }), { foo: 1 });
        src$Test$Test$$verify_record($$$Immutable$Immutable$$Record({ foo: 1 }).update($$$Immutable$Immutable$$Record({ foo: 2 })), { foo: 2 });
        src$Test$Test$$verify_record($$$Immutable$Immutable$$Record({ foo: 1 }).update([["foo", 3]]), { foo: 3 });

        src$Test$Test$$assert_raises(function () {
          $$$Immutable$Immutable$$Record({ foo: 1 }).update($$$Immutable$Immutable$$Record({ foo: 2, bar: 3 }));
        }, "Key bar not found");
      });

      src$Test$Test$$test("complex keys", function () {
        var o = $$$Immutable$Immutable$$Dict().set({}, 1);

        src$Test$Test$$assert_raises(function () {
          $$$Immutable$Immutable$$Record(o);
        }, "Expected string key but got [object Object]");

        src$Test$Test$$assert_raises(function () {
          Foo.get({});
        }, "Expected string key but got [object Object]");

        src$Test$Test$$assert_raises(function () {
          Foo.set({}, 5);
        }, "Expected string key but got [object Object]");

        src$Test$Test$$assert_raises(function () {
          Foo.modify({}, function () { throw new Error("FAIL") });
        }, "Expected string key but got [object Object]");
      });

      src$Test$Test$$test("=== when not modified", function () {
        var x = Foo;

        $$assert$$assert(x.set("foo", 1) === x);
        $$assert$$assert(x.set("foo", 2) !== x);

        $$assert$$assert(x.modify("foo", function () {
          return 1;
        }) === x);

        $$assert$$assert(x.modify("foo", function () {
          return 2;
        }) !== x);

        var x = $$$Immutable$Immutable$$Record({ foo: 1 });
        $$assert$$assert($$$Immutable$Immutable$$Record(x) === x);
        $$assert$$assert($$$Immutable$Immutable$$Record({ foo: 1 }) !== x);

        $$assert$$assert(x.update([]) === x);
        $$assert$$assert(x.update([["foo", 1]]) === x);
        $$assert$$assert(x.update([["foo", 2]]) !== x);
      });

      src$Test$Test$$test("equal", function () {
        $$assert$$assert(!$$$Immutable$Immutable$$equal(Empty, Foo));
        $$assert$$assert($$$Immutable$Immutable$$equal(Empty, Empty));
        $$assert$$assert($$$Immutable$Immutable$$equal(Foo, Foo));

        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Record({}), $$$Immutable$Immutable$$Record({})));
        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Record({ foo: 1 }), $$$Immutable$Immutable$$Record({ foo: 1 })));

        $$assert$$assert(!$$$Immutable$Immutable$$equal(Foo, $$$Immutable$Immutable$$Record({ foo: 2 })));
        $$assert$$assert($$$Immutable$Immutable$$equal(Foo, $$$Immutable$Immutable$$Record({ foo: 1 })));
        $$assert$$assert($$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Record({ foo: 2 }), $$$Immutable$Immutable$$Record({ foo: 2 })));
        $$assert$$assert(!$$$Immutable$Immutable$$equal($$$Immutable$Immutable$$Record({ foo: 2 }), $$$Immutable$Immutable$$Record({ foo: 3 })));
      });

      src$Test$Test$$test("toJS", function () {
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(Empty), {}));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS(Foo), { foo: 1 }));
        $$assert$$assert(src$Test$Test$$deepEqual($$toJS$$toJS($$$Immutable$Immutable$$Record({ foo: $$$Immutable$Immutable$$Record({ bar: 2 }) })),
                         { foo: { bar: 2 } }));
      });

      src$Test$Test$$test("forEach", function () {
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Record, []);
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Record, [["foo", 2]]);
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Record, [["foo", 2], ["bar", 3]]);
        src$Test$Test$$test_forEach($$$Immutable$Immutable$$Record, [["bar", 3], ["foo", 2]]);
      });

      // TODO
      /*test("zip", function () {
        var a = [["a", 1], ["b", 2], ["c", 3], ["d", 4],
                 ["e", 5], ["f", 6], ["g", 7], ["h", 8]];
        assert.equal(toArray(zip(Dict(a))), toArray(zip(a)));
      });*/
    });


    src$Test$Test$$test("isImmutable", function () {
      $$assert$$assert(!$$$Immutable$Immutable$$isImmutable(5));
      $$assert$$assert(!$$$Immutable$Immutable$$isImmutable({}));
      $$assert$$assert(!$$$Immutable$Immutable$$isImmutable([]));
      $$assert$$assert($$$Immutable$Immutable$$isImmutable($$$Immutable$Immutable$$Dict()));
      $$assert$$assert($$$Immutable$Immutable$$isImmutable($$$Immutable$Immutable$$Set()));
      $$assert$$assert($$$Immutable$Immutable$$isImmutable($$$Immutable$Immutable$$List()));
      $$assert$$assert($$$Immutable$Immutable$$isImmutable($$$Immutable$Immutable$$Queue()));
      $$assert$$assert($$$Immutable$Immutable$$isImmutable($$$Immutable$Immutable$$Stack()));
      $$assert$$assert($$$Immutable$Immutable$$isImmutable($$$Immutable$Immutable$$SortedDict($$Sorted$$defaultSort)));
      $$assert$$assert($$$Immutable$Immutable$$isImmutable($$$Immutable$Immutable$$SortedDict($$Sorted$$simpleSort)));
      $$assert$$assert($$$Immutable$Immutable$$isImmutable($$$Immutable$Immutable$$SortedSet($$Sorted$$defaultSort)));
      $$assert$$assert($$$Immutable$Immutable$$isImmutable($$$Immutable$Immutable$$SortedSet($$Sorted$$simpleSort)));

      var Foo = $$$Immutable$Immutable$$Record({});
      $$assert$$assert($$$Immutable$Immutable$$isImmutable(Foo));
    });

    src$Test$Test$$test("fromJS", function () {
      src$Test$Test$$verify_dict($$$Immutable$Immutable$$fromJS({ foo: 1 }), { foo: 1 });
      src$Test$Test$$verify_list($$$Immutable$Immutable$$fromJS([1, 2, 3]), [1, 2, 3]);

      src$Test$Test$$verify_dict($$$Immutable$Immutable$$fromJS({ foo: { bar: 1 } }), { foo: { bar: 1 } });
      src$Test$Test$$verify_list($$$Immutable$Immutable$$fromJS([1, [2], 3]), [1, [2], 3]);

      src$Test$Test$$verify_dict($$$Immutable$Immutable$$fromJS({ foo: { bar: 1 } }).get("foo"), { bar: 1 });
      src$Test$Test$$verify_list($$$Immutable$Immutable$$fromJS([1, [2], 3]).get(1), [2]);

      var x = new Date();
      $$assert$$assert($$$Immutable$Immutable$$fromJS(x) === x);

      var x = /foo/;
      $$assert$$assert($$$Immutable$Immutable$$fromJS(x) === x);

      $$assert$$assert($$$Immutable$Immutable$$fromJS("foo") === "foo");
      $$assert$$assert($$$Immutable$Immutable$$fromJS(5) === 5);
    });


    console.log("SUCCEEDED: " + src$Test$Test$$TESTS_SUCCEEDED + ", FAILED: " + src$Test$Test$$TESTS_FAILED);
}).call(this);

//# sourceMappingURL=Test.js.map