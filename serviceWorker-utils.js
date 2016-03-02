'use strict';

/**
 * Return a curried version of the provided function.
 *
 * @param {Function} fn - The function to be curried
 * @param {...mixed} args - Arguments to apply towards the curried function
 * @return {Function} The curried function
 * @example const min5 = curry(Math.min, 5); // min5(6) => 5
 * @example const add2 = curry((a, b) => a + b, 2); // add2(3) => 5
 */
const curry = (fn, ...args) => fn.bind(this, ...args);

/**
 * Determine if a constructor created an object instance.
 *
 * @param {mixed} constructr - The constructor to test against
 * @param {mixed} obj - The object instance to test against
 * @return {Boolean}
 * @example is(Request, new Request()); // => true
 * @example is(String, 'hello'); // => true
 * @example is(Number, 42); // => true
 */
const is = (constructr, obj) => {
  return obj && obj.constructor === constructr || obj instanceof constructr;
};

/**
 * Determine if a number of objects share the same property value.
 *
 * @param {String|Number} prop - The property name or index
 * @param {...Object|Array} objs - The objects or arrays to compare
 * @return {Boolean}
 * @example isPropEq('a', {a: 1}, {a: 1, b: 2}); // => true
 * @example isPropEq('origin', url.location, self.location); // => false
 * @example isPropEq(0, [1], [1, 2]); // => true
 */
const isPropEq = (prop, ...objs) => {
  return objs.reduce((prev, curr, index) => {
    return prev && curr[prop] === objs[index-1][prop];
  });
};

if (typeof module === 'object' && module.exports) {
  module.exports = { curry, is, isPropEq };
}
