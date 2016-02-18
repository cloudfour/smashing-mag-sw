'use strict';

const SMCacheUtils = {
  isStyleSheetUrl: url => /\.css$/.test(url),
  isScriptUrl: url => /\.js$/.test(url)
};

if (typeof module === 'object' && module.exports) {
  module.exports = SMCacheUtils;
}
