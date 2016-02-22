'use strict';

importScripts('SMCacheUtils.js');

const VERSION = '0.0.1';
const cachePaths = [
  '/example.css',
  '/assets/jason.png'
];

const cacheName = kind => `${VERSION}-${kind}`;
const isRequest = obj => obj instanceof Request;
const isResponse = obj => obj instanceof Response;
const isCacheUrl = url => cachePaths.includes(url.pathname);
const isLocalUrl = url => url.origin === location.origin;
const isGetRequest = request => request.method === 'GET';
const requestType = request => request.headers.get('Accept');
const responseType = response => response.headers.get('Content-Type');
const resourceType = obj => (isRequest(obj) ? requestType : responseType)(obj);
const resourceKind = obj => SMCacheUtils.getMIMECategory(resourceType(obj));

const shouldHandleRequest = function (request) {
  const url = new URL(request.url);
  const criteria = [
    isCacheUrl(url),
    isLocalUrl(url),
    isGetRequest(request)
  ];
  return criteria.every(result => result);
};

const cacheItem = function (request, response) {
  const responseClone = response.clone();
  const cacheKey = cacheName(resourceKind(response));
  caches.open(cacheKey).then(cache => cache.put(request, responseClone));
  return response;
};

const cacheStaticItems = function () {
  const cacheKey = cacheName('static');
  return caches.open(cacheKey).then(cache => cache.addAll(cachePaths));
};

addEventListener('install', event => {
  event.waitUntil(cacheStaticItems().then(skipWaiting));
});

addEventListener('activate', event => {
  // invalidate old caches
});

addEventListener('fetch', event => {
  const request = event.request;
  if (shouldHandleRequest(request)) {
    console.log(`${request.url} [${resourceKind(request)}] should be handled.`);
  }
});
