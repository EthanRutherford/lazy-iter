//this is the core iterator type
function* lazy(iterable) {
	for (const item of iterable) {
		yield item;
	}
}

//the lazy chaining methods
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

//sort helpers
function swap(array, a, b) {
	const tmp = array[a];
	array[a] = array[b];
	array[b] = tmp;
}

function median(array, sorter, a, b, c) {
	if (sorter(array[b], array[a]) > 0) {
		swap(array, a, b);
	}
	if (sorter(array[c], array[a]) > 0) {
		swap(array, a, c);
	}
	if (sorter(array[b], array[c]) > 0) {
		swap(array, b, c);
	}
}

//chain methods which must enumerate first
function* sort(sorter = (a, b) => b - a) {
	const enumerated = [...this];

	//in place recursion
	const stack = [[false, 0, enumerated.length - 1]];
	while (stack.length > 0) {
		const [shouldYield, first, last] = stack.pop();

		//base case
		if (shouldYield) {
			for (let i = first; i <= last; i++) {
				yield enumerated[i];
			}
			continue;
		} else if (first > last) {
			continue;
		}

		const middle = Math.floor(first + ((last - first) / 2));
		median(enumerated, sorter, first, middle, last);

		let i = first - 1;
		let j = last;
		let p = first - 1;
		let q = last;
		const pv = last;

		//3 way partition
		while (true) {
			while (sorter(enumerated[++i], enumerated[pv]) > 0);
			while (sorter(enumerated[pv], enumerated[--j]) > 0);
			if (i >= j) break;
			swap(enumerated, i, j);

			//set aside equal elements
			if (sorter(enumerated[i], enumerated[pv]) === 0) {
				swap(enumerated, i, ++p);
			}
			if (sorter(enumerated[j], enumerated[pv]) === 0) {
				swap(enumerated, j, --q);
			}
		}
		//ensure the value at i === pivot value
		let qlast = last;
		if (enumerated[i] !== enumerated[pv]) {
			swap(enumerated, i, pv);
			qlast--;
		}

		//move equal-to-pivot elements into a middle partition
		let u = i - 1;
		let v = i + 1;
		for (let k = first; k <= p; k++, u--) {
			swap(enumerated, u, k);
		}
		for (let k = qlast; k >= q; k--, v++) {
			swap(enumerated, v, k);
		}

		//add to stack to recurse
		stack.push([v === last, v, last]);
		stack.push([true, u + 1, v - 1]);
		stack.push([first === u, first, u]);
	}
}

function* reverse() {
	const enumerated = [...this];
	for (let i = enumerated.length - 1; i !== 0; i--) {
		yield enumerated[i];
	}
}

//single item retreival
function shift() {
	return this.next().value;
}

function pop() {
	return [...this].pop();
}

//search methods
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

//transform methods
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
