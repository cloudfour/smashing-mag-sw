'use strict';

importScripts('SMCacheUtils.js');

const VERSION = '0.0.1';
const cacheablePattern = /page[1-2]\.html$/;
const cacheablePaths = [
  'suitcss.css',
  'assets/pic1.jpg',
  'assets/pic2.jpg',
  'assets/pic3.jpg',
  'assets/pic4.jpg'
];

const curry = (fn, ...args) => fn.bind(this, ...args);
const toCacheName = key => `${VERSION}-${key}`;
const isCacheName = str => str.includes(VERSION, 0); // TODO: make less fragile.
const isSameOrigin = (objA, objB) => objA.origin === objB.origin;
const isRequest = obj => obj instanceof Request;
const isResponse = obj => obj instanceof Response;
const isLocalURL = curry(isSameOrigin, location);
const isGetRequest = req => req.method === 'GET';
const getHeader = (name, obj) => obj.headers.get(name);
const getRequestTypeHeader = curry(getHeader, 'Accept');
const getResponseTypeHeader = curry(getHeader, 'Content-Type');

const isCacheableURL = url => {
  const path = url.pathname.replace(/(\/)(smashing-mag-sw\/)?/, ''); // TODO: no
  const isPathIncluded = cacheablePaths.includes(path);
  const isURLMatching = cacheablePattern.test(url);
  return isPathIncluded || isURLMatching;
};

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

/**
 * cleanupCachedItems finds and deletes cached items that are outdated based on
 * VERSION. It returns a promise that resolves once all of the items have been
 * deleted from the cache.
 *
 * TODO: Explain this better, and maybe split into two functions.
 *
 * @return {Promise}
 */
const cleanupCachedItems = () => {
  return caches.keys().then(cacheKeys => {
    const expiredKeys = cacheKeys.filter(key => !isCacheName(key));
    const deletions = expiredKeys.map(key => caches.delete(key));
    return Promise.all(deletions);
  });
};

addEventListener('install', event => {
  const cacheName = toCacheName('static');
  event.waitUntil(
    cacheAllPaths(cacheablePaths, cacheName).then(skipWaiting)
  );
});

addEventListener('activate', event => {
  event.waitUntil(
    cleanupCachedItems().then(clients.claim())
  );
});

addEventListener('fetch', event => {
  const request = event.request;
  if (isRequestCacheable(request)) {
    let category = getResourceCategory(request);
    let cacheName = toCacheName(category);
    let respondFn;
    switch (category) {
      case 'content':
        respondFn = fetch(request).then(response => {
          return cacheRequestedItem(request, response, cacheName)
        });
        break;
      default:
        respondFn = caches.match(request);
        break;
    }
    event.respondWith(respondFn);
  }
});
