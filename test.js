import test from 'ava';
import SMCacheUtils from './SMCacheUtils';

test('isStyleSheetUrl', assert => {
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

test('isScriptUrl', assert => {
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

test('getMIMECategory', assert => {
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
