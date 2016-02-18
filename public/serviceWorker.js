'use strict';

importScripts('SMCacheUtils.js');

const VERSION = '0.0.1';
const cachePaths = [
  '/example.css'
];

const isCacheUrl = url => cachePaths.includes(url.pathname);
const isLocalUrl = url => url.origin === location.origin;
const isGetRequest = request => request.method === 'GET';

addEventListener('install', event => {
  // console.log('install');
});

addEventListener('activate', event => {
  // console.log('activate');
});

addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (isCacheUrl(url)) {
    console.log(`do something with ${url.pathname}`);
  }
});
