import { pad_right, repeat, join_lines } from "./util";

export var hash_interface = "__CFB38D33-7CD8-419E-A1B6-61D1B8AC7C83_hash__";

var mutable_hash_id = 0;

export function hash(x) {
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
    var hasher = x[hash_interface];
    if (hasher != null) {
      return hasher(x);

    } else {
      var id = "(Mutable " + (++mutable_hash_id) + ")";

      Object.defineProperty(x, hash_interface, {
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

export function hash_dict(x, spaces) {
  var a = [];

  var max_key = 0;

  x.forEach(function (_array) {
    var key   = hash(_array[0]);
    var value = hash(_array[1]);

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
    x.key[last] = pad_right(x.key[last], max_key, " ");

    var key = x.key.join("\n");

    var value = x.value.replace(/\n/g, "\n" + repeat(" ", max_key + 3));

    return key + " = " + value;
  });

  return join_lines(a, spaces);
}