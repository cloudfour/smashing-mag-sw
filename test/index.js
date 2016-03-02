import test from 'ava';
import 'babel-register'; // Only needed for Node 4 spread support :(
import * as utils from '../serviceWorker-utils';

test('utils.curry', (assert) => {
  const add = (a, b, c) => a + b + c;
  assert.plan(2);
  assert.ok(utils.curry(add, 1)(2, 3), 6, 'Ternary to binary');
  assert.ok(utils.curry(add, 1, 2)(3), 6, 'Ternary to unary');
});

test('utils.is', (assert) => {
  const noop = () => {};
  const Foo = noop;
  assert.plan(6);
  assert.ok(utils.is(String, 'str'), 'String');
  assert.ok(utils.is(Number, 1), 'Number');
  assert.ok(utils.is(Array, []), 'Array');
  assert.ok(utils.is(Object, {}), 'Object');
  assert.ok(utils.is(Function, noop), 'Function');
  assert.ok(utils.is(Foo, new Foo()), 'Foo');
});

test('utils.isPropEq', (assert) => {
  const objA = { a: 'A'};
  const objB = { a: 'A', b: 'B' };
  const objC = { a: 'A', b: 'B', c: 'C' };
  assert.plan(2);
  assert.ok(utils.isPropEq('a', objA, objB, objC), 'true when equal');
  assert.notOk(utils.isPropEq('b', objA, objB, objC), 'false when inequal');
});
