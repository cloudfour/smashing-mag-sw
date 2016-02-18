'use strict';

importScripts('SMCacheUtils.js');

self.addEventListener('install', event => {
  console.log('install');
});

self.addEventListener('activate', event => {
  console.log('activate');
});

self.addEventListener('fetch', event => {
  const isScript = SMCacheUtils.isScriptUrl(event.request.url);
  console.log(
    'fetch',
    `Is ${event.request.url} a script? ${isScript}`
  )
});
