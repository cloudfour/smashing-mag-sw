'use strict';

const SMCacheUtils = {
  isStyleSheetUrl: url => /\.css$/.test(url),
  isScriptUrl: url => /\.js$/.test(url),

  resourceKind (type) {
    switch (type.split('/')[0]) {
      case 'image': return 'image';
      case 'text': return 'content';
      default: return 'static';
    }
  }
};

if (typeof module === 'object' && module.exports) {
  module.exports = SMCacheUtils;
}
