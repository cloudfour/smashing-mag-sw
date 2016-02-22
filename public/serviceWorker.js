'use strict';

importScripts('SMCacheUtils.js');

const VERSION = '0.0.1';
const cacheablePaths = [
  '/example.css',
  '/assets/jason.png'
];

const getCacheName = key => `${VERSION}-${key}`;
const isRequest = obj => obj instanceof Request;
const isResponse = obj => obj instanceof Response;
const isCacheUrl = url => cacheablePaths.includes(url.pathname);
const isLocalUrl = url => url.origin === location.origin;
const isGetRequest = request => request.method === 'GET';
const getRequestTypeHeader = request => request.headers.get('Accept');
const getResponseTypeHeader = response => response.headers.get('Content-Type');

const getResourceTypeHeader = obj => {
  if (isRequest(obj)) return getRequestTypeHeader(obj);
  if (isResponse(obj)) return getResponseTypeHeader(obj);
};

const getResourceCategory = obj => {
  const typeHeader = getResourceTypeHeader(obj);
  return SMCacheUtils.getMIMECategory(typeHeader);
};

const shouldHandleRequest = request => {
  const url = new URL(request.url);
  const criteria = [
    isCacheUrl(url),
    isLocalUrl(url),
    isGetRequest(request)
  ];
  return criteria.every(result => result);
};

const cacheRequestedItem = (request, response, cacheName) => {
  const responseClone = response.clone();
  caches.open(cacheName).then(
    cache => cache.put(request, responseClone)
  );
  return response;
};

const cacheAllPaths = (paths, cacheName) => {
  return caches.open(cacheName).then(
    cache => cache.addAll(paths)
  );
};

addEventListener('install', event => {
  const cacheName = getCacheName('static');
  event.waitUntil(
    cacheAllPaths(cacheablePaths, cacheName).then(skipWaiting)
  );
});

addEventListener('activate', event => {
  // invalidate old caches
});

addEventListener('fetch', event => {
  const request = event.request;
  if (shouldHandleRequest(request)) {

  }
});
