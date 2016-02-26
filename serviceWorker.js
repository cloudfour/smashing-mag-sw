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

/**
 * openCache optionally receives one or more string arguments used to construct
 * a key for caches.open(). If no arguments are supplied, the `VERSION` constant
 * alone will be used as the cache key.
 *
 * @param {...String}
 * @return {Promise}
 * @example
 *
 *    openCache('images').then(cache => ...); // key is "0.0.0-images"
 */
const openCache = (...args) => {
  const key = [VERSION].concat(args).join('-');
  return caches.open(key);
};

/**
 * isCacheableURL receives a URL instance and returns true or false depending on
 * whether or not:
 *
 * - its pathname exists within the `cacheablePaths` array
 * - its value matches the `cacheablePattern` regex
 *
 * TODO: Clean up that nasty replacement regex (for GH Pages)
 *
 * @param {URL}
 * @return {Boolean}
 * @example
 *
 *    isCacheableURL(new URL('example.com/nope')); // => false
 */
const isCacheableURL = url => {
  const path = url.pathname.replace(/(\/)(smashing-mag-sw\/)?/, '');
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
 * This is the installation handler. It runs when the worker is first installed.
 * It precaches the asset paths in the `cacheablePaths` array.
 */
addEventListener('install', event => {
  event.waitUntil(
    openCache('static')
      .then(cache => cache.addAll(cacheablePaths))
      .then(skipWaiting)
  );
});

/**
 * This is the activation handler. It runs after the worker is installed. It
 * handles the deletion of stale cache responses.
 */
addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        const isExpired = k => !isCacheName(k);
        const deletions = keys.filter(isExpired).map(k => caches.delete(k));
        return Promise.all(deletions);
      })
      .then(clients.claim())
  );
});

addEventListener('fetch', event => {
  const request = event.request;
  if (isRequestCacheable(request)) {
    event.respondWith(
      /**
       * This is tricky:
       * https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/match
       * Opposed to these docs, .match() does not seem to throw anything when no
       * matching items are found. So instead of using .catch() here, we use
       * .then() and check the value of response (which could be undefined).
       */
      caches.match(request).then(response => {
        // The request was found in the cache; return it.
        if (isResponse(response)) {
          return response;
        }
        // The request wasn't found; add it to (and return it from) the cache.
        return openCache()
          .then(cache => cache.add(request))
          .then(() => caches.match(request))
      })
    );
  }
});
