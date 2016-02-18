'use strict';

importScripts('SMCacheUtils.js');

const VERSION = '0.0.1';
const cachePaths = [
  '/example.css'
];

const cacheName = key => `${VERSION}-${key}`;
const isCacheUrl = url => cachePaths.includes(url.pathname);
const isGetRequest = request => request.method === 'GET';
const isLocalUrl = url => url.origin === location.origin;

function addToCache (cacheKey, request, response) {
  if (response.ok) {
    var copy = response.clone();
    caches.open(cacheKey).then(cache => {
      cache.put(request, copy);
    });
  }
  return response;
}

function fetchFromCache (request) {
  return caches.match(request).then(response => {
    if (!response) {
      throw Error(`${request.url} not found in cache`);
    }
    return response;
  });
}

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
