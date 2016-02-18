import test from 'ava';
import SMCacheUtils from './public/SMCacheUtils';

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
