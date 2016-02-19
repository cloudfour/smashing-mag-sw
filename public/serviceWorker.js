'use strict';

importScripts('SMCacheUtils.js');

const VERSION = '0.0.1';
const TYPES = ['image', 'content'];
const TYPES_DEFAULT = 'static';
const cachePaths = [
  '/example.css',
  '/jason.png'
];

const cacheName = key => `${VERSION}-${key}`;
const isRequest = obj => obj instanceof Request;
const isResponse = obj => obj instanceof Response;
const isCacheUrl = url => cachePaths.includes(url.pathname);
const isLocalUrl = url => url.origin === location.origin;
const isGetRequest = request => request.method === 'GET';
const requestType = request => request.headers.get('Accept');
const responseType = response => response.headers.get('Content-Type');

const resourceType = function resourceType (obj) {
  const mime = (isRequest(obj) ? requestType : responseType)(obj);
  return TYPES.find(type => mime.includes(type)) || TYPES_DEFAULT;
};

const addToCache = function addToCache (request, response) {
  const cacheKey = cacheName(resourceType(response));
  caches.open(cacheKey).then(
    cache => cache.put(request, response.clone())
  );
  return response;
};

const getFromCache = function getFromCache (request) {
  return caches.match(request);
};

addEventListener('install', event => {
  // precache stuff
});

addEventListener('activate', event => {
  // invalidate old caches
});

addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (isCacheUrl(url)) {
    // respond from cache, adding to it first if needed
  }
});
