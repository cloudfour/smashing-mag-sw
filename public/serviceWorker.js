'use strict';

importScripts('SMCacheUtils.js');

const VERSION = '0.0.1';
const cacheablePaths = [
  '/example.css',
  '/assets/jason.png'
];

const toCacheName = key => `${VERSION}-${key}`;
const isRequest = obj => obj instanceof Request;
const isResponse = obj => obj instanceof Response;
const isCacheableURL = url => cacheablePaths.includes(url.pathname);
const isLocalURL = url => url.origin === location.origin;
const isGetRequest = request => request.method === 'GET';
const getRequestTypeHeader = request => request.headers.get('Accept');
const getResponseTypeHeader = response => response.headers.get('Content-Type');

/**
 * getResourceTypeHeader receives a Request or Response instance, and returns a
 * header value indicating the MIME-type of that object.
 *
 * @param {Request|Response} obj
 * @return {String}
 * @example
 *
 *    getResourceTypeHeader(cssRequest); // => 'text/css'
 */
const getResourceTypeHeader = obj => {
  if (isRequest(obj)) return getRequestTypeHeader(obj);
  if (isResponse(obj)) return getResponseTypeHeader(obj);
};

/**
 * getResourceCategory receives a Request or Response instance, and returns a
 * generic category for the MIME-type of that object. See SMCacheUtils.js for
 * the potential category values.
 *
 * @param {Request|Response} obj
 * @return {String}
 * @example
 *
 *    getResourceCategory(htmlResponse); // => 'content'
 */
const getResourceCategory = obj => {
  const typeHeader = getResourceTypeHeader(obj);
  return SMCacheUtils.getMIMECategory(typeHeader);
};

/**
 * isRequestCacheable receives a Request instance and returns true or false
 * depending on the properties of its URL and header values.
 *
 * @param {Request} request
 * @return {Boolean}
 * @example
 *
 *    isRequestCacheable(siteLogoRequest); // => true
 *    isRequestCacheable(thirdPartyScriptRequest); // => false
 */
const isRequestCacheable = request => {
  const url = new URL(request.url);
  const criteria = [
    isCacheableURL(url),
    isLocalURL(url),
    isGetRequest(request)
  ];
  return criteria.every(result => result);
};

/**
 * cacheRequestedItem adds to or updates the cache with a new Response before
 * returning it.
 *
 * TODO: Explain this better.
 *
 * @param {Request} request
 * @param {Response} response
 * @param {String} cacheName
 * @return {Response}
 */
const cacheRequestedItem = (request, response, cacheName) => {
  const responseClone = response.clone();
  caches.open(cacheName).then(
    cache => cache.put(request, responseClone)
  );
  return response;
};

/**
 * cacheAllPaths receives an array of filepaths to cache all at once. It returns
 * a promise that will resolve when those items have been cached.
 *
 * TODO: Explain this better.
 *
 * @param {Array} paths
 * @param {String} cacheName
 * @return {Promise}
 */
const cacheAllPaths = (paths, cacheName) => {
  return caches.open(cacheName).then(
    cache => cache.addAll(paths)
  );
};

addEventListener('install', event => {
  const cacheName = toCacheName('static');
  event.waitUntil(
    cacheAllPaths(cacheablePaths, cacheName).then(skipWaiting)
  );
});

addEventListener('activate', event => {
  // invalidate old caches
});

addEventListener('fetch', event => {
  const request = event.request;
  if (isRequestCacheable(request)) {

  }
});
