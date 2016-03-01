'use strict';

const curry = (fn, ...args) => fn.bind(this, ...args);

const is = (constructr, obj) => obj.constructor === constructr;

const isPropEq = (prop, ...objs) => {
  return objs.reduce((prev, curr, index) => {
    return prev && curr[prop] === objs[index-1][prop];
  });
};

if (typeof module === 'object' && module.exports) {
  module.exports = { curry, is, isPropEq };
}
