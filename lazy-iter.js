// this is the core iterator type
function* lazy(iterable) {
	for (const item of iterable) {
		yield item;
	}
}

// the lazy chaining methods
function* filter(filterer) {
	for (const item of this) {
		if (filterer(item)) {
			yield item;
		}
	}
}

function* map(mapper) {
	for (const item of this) {
		yield mapper(item);
	}
}

function* slice(start = 0, end = Infinity) {
	let i = 0;
	let val;
	while (i < start && !(val = this.next()).done) {
		i++;
	}

	while (i++ < end && !(val = this.next()).done) {
		yield val.value;
	}
}

function* splice(start = 0, deleteCount = 0, ...items) {
	let i = 0;
	let val;
	while (i++ < start && !(val = this.next()).done) {
		yield val.value;
	}

	i = 0;
	while (i++ < deleteCount && !(val = this.next()).done);

	for (const item of items) {
		yield item;
	}

	for (const item of this) {
		yield item;
	}
}

function* fill(value, start = 0, end = Infinity) {
	let i = 0;
	let val;
	while (i < start && !(val = this.next()).done) {
		yield val.value;
		i++;
	}

	while (i++ < end && !(val = this.next()).done) {
		yield value;
	}

	for (const item of this) {
		yield item;
	}
}

function* push(...values) {
	for (const item of this) {
		yield item;
	}
	for (const item of values) {
		yield item;
	}
}

function* unshift(...values) {
	for (const item of values) {
		yield item;
	}
	for (const item of this) {
		yield item;
	}
}

function* concat(other) {
	for (const item of this) {
		yield item;
	}

	for (const item of other) {
		yield item;
	}
}

function* forEach(method) {
	for (const item of this) {
		method(item);
		yield item;
	}
}

// heapsort helpers
function siftUp(array, compare, root) {
	const end = array.length;
	const start = root;
	const rootItem = array[root];

	let child;
	while ((child = 2 * root + 1) < end) {
		if (child + 1 < end && compare(array[child], array[child + 1]) <= 0) {
			child++;
		}

		array[root] = array[child];
		root = child;
	}

	array[root] = rootItem;
	siftDown(array, compare, start, root);
}

function siftDown(array, compare, start, root) {
	const rootItem = array[root];

	while (root > start) {
		const parent = (root - 1) >> 1;
		const parentItem = array[parent];
		if (compare(rootItem, parentItem) > 0) {
			array[root] = parentItem;
			root = parent;
		} else {
			break;
		}
	}

	array[root] = rootItem;
}

function heapify(array, compare) {
	for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
		siftUp(array, compare, i);
	}

	return array;
}

// chain methods which must enumerate first
function* sort(compare = (a, b) => b - a) {
	const heap = heapify([...this], compare);

	while (heap.length) {
		const lastItem = heap.pop();
		if (heap.length) {
			const value = heap[0];
			heap[0] = lastItem;
			siftUp(heap, compare, 0);
			yield value;
		} else {
			yield lastItem;
		}
	}
}

function* reverse() {
	const enumerated = [...this];
	for (let i = enumerated.length - 1; i !== 0; i--) {
		yield enumerated[i];
	}
}

// single item retreival
function shift() {
	return this.next().value;
}

function pop() {
	return [...this].pop();
}

// search methods
function every(condition) {
	for (const item of this) {
		if (!condition(item)) {
			return false;
		}
	}

	return true;
}

function some(condition) {
	for (const item of this) {
		if (condition(item)) {
			return true;
		}
	}

	return false;
}

function find(condition) {
	for (const item of this) {
		if (condition(item)) {
			return item;
		}
	}

	return undefined;
}

function includes(item) {
	for (const theItem of this) {
		if (item === theItem) {
			return true;
		}
	}

	return false;
}

// transform methods
function reduce(reducer, initialValue) {
	for (const item of this) {
		initialValue = reducer(initialValue, item);
	}

	return initialValue;
}

function reduceRight(reducer, initialValue) {
	const enumerated = [...this];
	for (let i = this.length - 1; i >= 0; i--) {
		initialValue = reducer(initialValue, enumerated[i]);
	}

	return initialValue;
}

function join(separator) {
	return [...this].join(separator);
}

function toArray(valueSelector = (x) => x) {
	return [...this.map(valueSelector)];
}

function toObject(keySelector, valueSelector = (x) => x) {
	return this.reduce((obj, item) => {
		obj[keySelector(item)] = valueSelector(item);
		return obj;
	}, {});
}

function toSet(valueSelector = (x) => x) {
	return new Set(this.map(valueSelector));
}

function toMap(keySelector, valueSelector = (x) => x) {
	return new Map(this.map((item) => [keySelector(item), valueSelector(item)]));
}

lazy.prototype.filter = filter;
lazy.prototype.map = map;
lazy.prototype.slice = slice;
lazy.prototype.splice = splice;
lazy.prototype.fill = fill;
lazy.prototype.push = push;
lazy.prototype.unshift = unshift;
lazy.prototype.concat = concat;
lazy.prototype.forEach = forEach;

lazy.prototype.sort = sort;
lazy.prototype.reverse = reverse;

lazy.prototype.shift = shift;
lazy.prototype.pop = pop;

lazy.prototype.every = every;
lazy.prototype.some = some;
lazy.prototype.find = find;
lazy.prototype.includes = includes;

lazy.prototype.reduce = reduce;
lazy.prototype.reduceRight = reduceRight;
lazy.prototype.join = join;
lazy.prototype.toArray = toArray;
lazy.prototype.toObject = toObject;
lazy.prototype.toSet = toSet;
lazy.prototype.toMap = toMap;

filter.prototype = lazy.prototype;
map.prototype = lazy.prototype;
slice.prototype = lazy.prototype;
splice.prototype = lazy.prototype;
fill.prototype = lazy.prototype;
push.prototype = lazy.prototype;
unshift.prototype = lazy.prototype;
concat.prototype = lazy.prototype;
forEach.prototype = lazy.prototype;
sort.prototype = lazy.prototype;
reverse.prototype = lazy.prototype;

lazy.from = lazy;
lazy.of = (...items) => lazy(items);
lazy.keys = (object) => lazy(Object.keys(object));
lazy.values = (object) => lazy(Object.values(object));
lazy.entries = (object) => lazy(Object.entries(object));

module.exports = lazy;
