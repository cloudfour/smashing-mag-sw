'use strict';

/**
 * Return a curried version of the provided function.
 *
 * @param {Function} fn
 * @param {...*} args
 * @example
 * const min5 = curry(Math.min, 5);
 * min5(6); // => 5
 */
const curry = (fn, ...args) => fn.bind(this, ...args);

/**
 * Determine if a constructor created an object.
 *
 * @param {*} constructr
 * @param {*} obj
 * @return {Boolean}
 * @example
 * is(Request, new Request()); // => true
 */
const is = (constructr, obj) => {
  return obj && obj.constructor === constructr || obj instanceof constructr;
};

/**
 * Determine if a number of objects share the same property value.
 *
 * @param {String} prop
 * @param {...Object} objs
 * @return {Boolean}
 * @example
 * const objA = { foo: 1 };
 * const objB = { foo: 1, bar: 2 };
 * isPropEq('foo', objA, objB); // => true
 */
const isPropEq = (prop, ...objs) => {
  return objs.reduce((prev, curr, index) => {
    return prev && curr[prop] === objs[index-1][prop];
  });
};

/**
 * @ignore
 */
if (typeof module === 'object' && module.exports) {
  module.exports = { curry, is, isPropEq };
}
