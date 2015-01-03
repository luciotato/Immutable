How to use
==========

Just load up `build/Immutable.js`. It works with AMD, CommonJS / Node.js, and browser globals.

You can find documentation in the `doc` folder.

You can find benchmarks in the `benchmarks` folder.


Quick overview
==============

* `Dict` `SortedDict`

  * `has` `get` `set` `remove` `modify` `merge`

* `Set` `SortedSet`

  * `has` `add` `remove` `union` `intersect` `disjoint` `subtract`

* `List`

  * `size` `has` `get` `insert` `remove` `modify` `slice` `concat`

* `Queue`

  * `size` `peek` `push` `pop` `concat`

* `Stack`

  * `size` `peek` `push` `pop` `concat`

* `Record`

  * `get` `set` `modify` `update`

* `Ref`

  * `get` `set` `modify`

----

`Dict` and `Set` can have anything as keys, including mutable objects and immutable objects (`Dict`, `Set`, `List`, etc.)

You can also use `SortedDict` and `SortedSet` to define your own custom sorting.

----

Equality is well defined, and is based on [egal](http://home.pipeline.com/~hbaker1/ObjectIdentity.html).

What that means is that mutable objects are only equal if they are exactly the same object, but immutable objects are equal if they have the same value.

These two mutable objects are different, and so they are not equal:

    // false
    equal({ foo: 1 },
          { foo: 1 });

These two immutable objects are different, but they have the same keys/values, and so they are equal:

    // true
    equal(Dict({ foo: 1 }),
          Dict({ foo: 1 }));

This is the only sane default behavior for equality.

----

You can easily convert from JavaScript to Immutable and from Immutable to JavaScript:

    var obj  = { foo: 1 };
    var dict = fromJS(obj);
    var obj  = toJS(dict);

You can also use this to convert from one data type to another:

    var dict   = Dict({ foo: 1 });
    var list   = List(dict);
    var stack  = Stack(list);
    var record = Record(stack);

You can also losslessly convert to/from JSON, allowing for sending Immutable objects over the network:

    var record = Record({ foo: 1 });
    var json   = toJSON(record);
    var record = fromJSON(json);


For developers
==============

You'll probably need to use `npm install` to get the required dependencies. Every time you make a change to the `src` directory, you have to run `npm install` to rebuild.

Run the benchmarks with `node build/Benchmark.js`. This will take a long time (several minutes, possibly hours).

The unit tests are automatically run when using `npm install`, but you can also run them manually by using `node build/Test.js`.
