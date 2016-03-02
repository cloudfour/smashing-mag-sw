import test from 'ava';
import 'babel-register'; // Only needed for Node 4 spread support :(
import SMCacheUtils from '../SMCacheUtils';
import * as utils from '../serviceWorker-utils';

test('isStyleSheetUrl', (assert) => {
  const { isStyleSheetUrl } = SMCacheUtils;
  assert.plan(2);
  assert.true(
    isStyleSheetUrl('example.css'),
    'returns true when given a CSS URL'
  );
  assert.false(
    isStyleSheetUrl('example.txt'),
    'returns false when given a non-CSS URL'
  );
});

test('isScriptUrl', (assert) => {
  const { isScriptUrl } = SMCacheUtils;
  assert.plan(2);
  assert.true(
    isScriptUrl('example.js'),
    'returns true when given a JS URL'
  );
  assert.false(
    isScriptUrl('example.txt'),
    'returns false when given a non-JS URL'
  );
});

test('getMIMECategory', (assert) => {
  const { getMIMECategory } = SMCacheUtils;
  assert.plan(3);
  assert.same(
    getMIMECategory('text/css'),
    'static',
    'categorizes CSS as static'
  );
  assert.same(
    getMIMECategory('text/html'),
    'content',
    'categorizes HTML as content'
  );
  assert.same(
    getMIMECategory('image/svg+xml'),
    'image',
    'categorizes SVG as image'
  );
});

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
