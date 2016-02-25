'use strict';

const MIME_TYPES = {
  image: [
    'image/svg+xml',
    'image/png',
    'image/jpeg',
    'image/gif'
  ],
  content: [
    'text/html',
    'application/xml',
    'text/plain'
  ],
  static: [
    'text/css',
    'application/javascript'
  ]
};

const SMCacheUtils = {
  isStyleSheetUrl: url => /\.css$/.test(url),
  isScriptUrl: url => /\.js$/.test(url),

  getMIMECategory (mimeType) {
    const keys = Object.keys(MIME_TYPES);
    // Attempts to use [].includes() here resulted in Node errors. Supported?
    const result = keys.find(key => {
      return MIME_TYPES[key].some(type => mimeType.indexOf(type) !== -1);
    });
    return result;
  }
};

if (typeof module === 'object' && module.exports) {
  module.exports = SMCacheUtils;
}
