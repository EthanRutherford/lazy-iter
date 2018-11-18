# lazy-iter

lazy-iter provides a suite of generator methods which all share a
common prototype (named lazy)

```javascript
const lazy = require("lazy-iter");
```

The `lazy` method is used to wrap any iterable into the base class, transforming
it into a `lazy-iter`.

```javascript
const enumerable = lazy([1, 2, 3, 4]); // iter:[1, 2, 3, 4]
```

The returned object now provides access to several lazy methods, most of which are
nearly identical in usage to Array methods. These methods also, when appropriate,
return `lazy-iter`s, allowing you to compose iterator chains, similar to linq.

```javascript
enumerable.filter(x => x < 4).map(y => y * 2).slice(1); // iter:[4, 6]
```

`lazy-iter` implements nearly every method of `Array`s, with a handful of caveats,
and a few additional methods which are useful.

## Array methods not present in `lazy-iter`
`Array.isArray` - has no practical application

`Array.prototype.copyWithin` - this method assumes the user knows values before
enumeration, which is unlikely to actually be the case

`findIndex, indexOf, lastIndexOf` - methods dealing with indices are unusual in an
iterator context

`toString, toSource, toLocaleString` - a `lazy-iter` can simply be flattened to an array first

`keys, values, entries` - returning an iterator from an iterator is redundant

## Additional methods
`lazy.keys` - similar to `lazy`, but takes `Object.keys` of the input

`lazy.values` - similar to `lazy`, but takes `Object.values` of the input

`lazy.entries` - similar to `lazy`, but takes `Object.entries` of the input

`lazy.prototype.toArray` - receives an optional value selector, then consumes
the entire sequence into an array, applying the selector to each item

`lazy.prototype.toObject` - receives a key selector, and optional value selector,
consumes the sequence to produce an object mapping keys to values.

`lazy.prototype.toSet` - identical to `toArray`, but returns a set

`lazy.prototype.toMap` - identical to `toObject`, but returns a map

## Method Caveats

All array-like methods which deal with indices do not use indices in `lazy-iter`.
For example, `map` takes in a callback method which recieves three arguments:
`(item, index, array)`. In `lazy-iter`, the index and reference to the array are,
for obvious reasons, omitted from callbacks.

In addition, array-like methods which take positions as input (such as slice and
splice) do not treat negative indices as values starting from the end of the
sequence, as that would require knowing the length of the sequence ahead of time.
Instead, negative numbers will simply behave like `0`.

`lazy-iter` instances are also immutable: the underlying sequence is never mutated;
rather, a new instance with the new sequence is returned. This is only relevant in
a handful of cases, as this maps to most array methods naturally.

`splice` is one such method which does have a noticeable change. The array version
mutates the array, and returns deleted items. `lazy-iter`'s version simply
returns the new sequence with the specified range deleted/replaced with new values.

There are additionally four methods which one must keep aware of, as they are not perfectly lazy.
The first two must consume the full sequence on the first call to `next`, but are
afterwards as lazy as possible. The other two are simply not as similar to each
other as they would appear to be.

`reverse` must consume the entire sequence in order to reach the end, and return
an iterator which walks back through in reverse order.

`sort` must similarly consume the sequence first. However, it still lazily sorts
the consumed list by performing a heapSort; heapifying the full list, and 
returning items by popping them from the resulting heap.

`shift` is an odd case, not necessarily unlazy, but it returns the first item
of the sequence, as opposed a new sequence, leaving the initial sequence only
partially-consumed.

`pop` is similar to shift, but worse, as it must consume the entire sequence to
be able to return the last value. One should typically only use these two methods
as the final operation on a sequence.

The search methods can potentially also partially consume sequences, so they also
should be the final operation. 

The reduction methods (reduce, join, toArray...) will of course all wholly consume
the sequence and return a single, non-iterator value.

## List of methods
```javascript
const lazy = require("lazy-iter");
//static methods
lazy(iterable);             //returns an instance of lazy-iter
lazy.from(iterable);        //alias of lazy()
lazy.of(...args);           //shorthand for lazy([...args])
lazy.keys(object);          //shorthand for lazy(Object.keys(object))
lazy.values(object);        //shorthand for lazy(Object.values(object))
lazy.entries(object);       //shorthand for lazy(Object.entries(object))

//chainable iterator methods
lazy.prototype.filter(filterMethod);
lazy.prototype.map(mappingMethod);
lazy.prototype.slice(start = 0, end = Infinity);
lazy.prototype.splice(start = 0, deleteCount = 0, ...items);
lazy.prototype.fill(value, start = 0, end = 0);
lazy.prototype.push(...items);
lazy.prototype.unshift(...items);
lazy.prototype.concat(otherIterable);
lazy.prototype.forEach(someMethod);

//chainable methods which must consume the full sequence up front (but are still lazy)
lazy.prototype.sort(sortMethod = (a, b) => b - a);
lazy.prototype.reverse();

//methods for retrieving first or last item
lazy.prototype.shift();
lazy.prototype.pop();

//conditional search methods
lazy.prototype.every(conditionMethod);
lazy.prototype.some(conditionMethod);
lazy.prototype.find(conditionMethod);
lazy.prototype.includes(item);

//methods which consume the sequence to return a singular item
lazy.prototype.reduce(reduceMethod);
lazy.prototype.reduceRight(reduceMethod);
lazy.prototype.join(separator = ",");
lazy.prototype.toArray(valueSelector = null);
lazy.prototype.toObject(keySelector, valueSelector = null);
lazy.prototype.toSet(valueSelector = null);
lazy.prototype.toMap(keySelector, valueSelector = null);
```
