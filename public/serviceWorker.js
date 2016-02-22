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
}

const getResourceCategory = obj => {
  const typeHeader = getResourceTypeHeader(obj);
  return SMCacheUtils.getMIMECategory(typeHeader);
}

const shouldHandleRequest = function (request) {
  const url = new URL(request.url);
  const criteria = [
    isCacheUrl(url),
    isLocalUrl(url),
    isGetRequest(request)
  ];
  return criteria.every(result => result);
};

const cacheRequestedItem = function (request, response) {
  const responseClone = response.clone();
  const cacheKey = getCacheName(getResourceCategory(response));
  caches.open(cacheKey).then(cache => cache.put(request, responseClone));
  return response;
};

const cacheStaticItems = function () {
  const cacheKey = getCacheName('static');
  return caches.open(cacheKey).then(cache => cache.addAll(cacheablePaths));
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

  }
});
