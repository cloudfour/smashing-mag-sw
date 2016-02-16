'use strict';

importScripts('SMCacher.js');

self.addEventListener('install', event => {
  self.cacher = SMCacher();
});

self.addEventListener('activate', event => {
  self.cacher.init();
});

self.addEventListener('fetch', event => {
  console.log(
    `Is ${event.request.url} a script? ${isScriptUrl(event.request.url)}`
  )
});
