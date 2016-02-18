import test from 'ava';
import SMCacheUtils from './public/SMCacheUtils';

test('isStyleSheetUrl', t => {
  const { isStyleSheetUrl } = SMCacheUtils;
  t.plan(2);
  t.true(
    isStyleSheetUrl('example.css'),
    'returns true when given a CSS URL'
  );
  t.false(
    isStyleSheetUrl('example.txt'),
    'returns false when given a non-CSS URL'
  );
});

test('isScriptUrl', t => {
  const { isScriptUrl } = SMCacheUtils;
  t.plan(2);
  t.true(
    isScriptUrl('example.js'),
    'returns true when given a JS URL'
  );
  t.false(
    isScriptUrl('example.txt'),
    'returns false when given a non-JS URL'
  );
});
