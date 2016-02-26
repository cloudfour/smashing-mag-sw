/* global self, caches, URL, Request, Response */
/* eslint indent: [2, 2] */
/* eslint-env es6 */

'use strict';

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
const isCacheName = str => str.includes(VERSION, 0); // TODO: make less fragile.
const isSameOrigin = (objA, objB) => objA.origin === objB.origin;
const isRequest = obj => obj instanceof Request;
const isResponse = obj => obj instanceof Response;
const isLocalURL = curry(isSameOrigin, self.location);
const isGetRequest = req => req.method === 'GET';
const getHeader = (name, obj) => obj.headers.get(name);
const getRequestTypeHeader = curry(getHeader, 'Accept');
const getResponseTypeHeader = curry(getHeader, 'Content-Type');

/**
 * getResourceTypeHeader receives a Request or Response instance, and it returns
 * a header value indicating the MIME-type of that object.
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
 * contentType receives a Request or Response instance, and it returns a generic
 * string alias for the MIME-type of that object.
 *
 * @param {Request|Response} obj
 * @return {String}
 * @example
 *
 *    contentType(new Request('foo.html')); // => 'content'
 */
const contentType = obj => {
  const typeHeader = getResourceTypeHeader(obj);
  const typePatterns = {
    image: /^image\//,
    content: /^text\/(html|xml|xhtml)/
  };
  return Object.keys(typePatterns).find(key => {
    const pattern = typePatterns[key];
    return pattern.test(typeHeader);
  });
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
 * isCacheableRequest receives a Request instance and returns true or false
 * depending on the properties of its URL and header values.
 *
 * @param {Request} request
 * @return {Boolean}
 * @example
 *
 *    isCacheableRequest(siteLogoRequest); // => true
 *    isCacheableRequest(thirdPartyScriptRequest); // => false
 */
const isCacheableRequest = request => {
  const url = new URL(request.url);
  const criteria = [
    isCacheableURL(url),
    isLocalURL(url),
    isGetRequest(request)
  ];
  return criteria.every(result => result);
};

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
 * This is the installation handler. It runs when the worker is first installed.
 * It precaches the asset paths in the `cacheablePaths` array.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    openCache('static')
      .then(cache => cache.addAll(cacheablePaths))
      .then(self.skipWaiting)
  );
});

/**
 * This is the activation handler. It runs after the worker is installed. It
 * handles the deletion of stale cache responses.
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        const isExpired = k => !isCacheName(k);
        const deletions = keys.filter(isExpired).map(k => caches.delete(k));
        return Promise.all(deletions);
      })
      .then(self.clients.claim())
  );
});

/**
 * This is the fetch handler. It runs upon every request, but it only acts upon
 * requests that return true when passed to `isCacheableRequest`. It both
 * serves requests from the cache and adds requests to the cache.
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  if (isCacheableRequest(request)) {
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
        return openCache(contentType(request))
          .then(cache => cache.add(request))
          .then(() => caches.match(request));
      })
    );
  }
});
