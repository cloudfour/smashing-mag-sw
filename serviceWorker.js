/**
 * @ignore
 */
'use strict';

self.importScripts(
  'serviceWorker-utils.js',
  'serviceWorker-precache.js'
);

const VERSION = '0.0.1';

const BUCKET_PATTERNS = {
  static: /^(text|application)\/(css|javascript)/,
  image: /^image\//,
  content: /^text\/(html|xml|xhtml)/
};

const BUCKET_KEYS = Object.keys(BUCKET_PATTERNS);

const CACHEKEY_DELIM = '-';

const CACHEKEY_REGEXP = new RegExp([
  `(${VERSION.replace(/(\W)/g, '\\$1')})`,
  CACHEKEY_DELIM,
  `(${BUCKET_KEYS.join('|')})`,
  `(${CACHEKEY_DELIM}.+)?`
].join(''));

const CACHEABLE_REGEX = /(page[1-2]\.html)$/;

const isLocalURL = curry(isPropEq, 'origin', self.location);
const isCacheableURL = (url) => CACHEABLE_REGEX.test(url);
const isGetRequest = (req) => req.method === 'GET';

/**
 * `getTypeHeader()` receives a `Request` or `Response` instance, and it
 * returns a header value indicating the MIME-type of that object.
 *
 * @param {Request|Response} obj
 * @return {String}
 * @example getTypeHeader(cssRequest); // => 'text/css'
 */
const getTypeHeader = (obj) => {
  switch (obj.constructor) {
    case Request: return obj.headers.get('Accept');
    case Response: return obj.headers.get('Content-Type');
    default: break;
  }
};

/**
 * `contentType()` receives a `Request` or `Response` instance, and it returns a
 * generic string alias for the MIME-type of that object.
 *
 * @param {Request|Response} obj
 * @return {String}
 * @example contentType(new Request('foo.html')); // => 'content'
 */
const contentType = (obj) => {
  const typeHeader = getTypeHeader(obj);
  return BUCKET_KEYS.find((name) => BUCKET_PATTERNS[name].test(typeHeader));
};

/**
 * `isCacheableRequest()` receives a `Request` instance and returns `true` or
 * `false` depending on the properties of its URL and header values.
 *
 * @param {Request} request
 * @return {Boolean}
 * @example isCacheableRequest(new Request('logo.svg')); // => true
 */
const isCacheableRequest = (request) => {
  const url = new URL(request.url);
  const criteria = [
    isCacheableURL(url),
    isLocalURL(url),
    isGetRequest(request)
  ];
  return criteria.every((result) => result === true);
};

/**
 * `openCache()` optionally receives one or more string arguments used to
 * construct a key for `caches.open()`. If no arguments are supplied, the
 * `VERSION` constant alone will be used as the cache key.
 *
 * @param {...String} args
 * @return {Promise}
 * @example openCache('images').then(cache => ...); // key is "0.0.0-images"
 */
const openCache = (...args) => {
  const key = [VERSION].concat(args).join(CACHEKEY_DELIM);
  return caches.open(key);
};

/**
 * @ignore
 * This is the installation handler. It runs when the worker is first installed.
 * It precaches the asset paths in the `REQUIRED_PATHS` array.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    openCache('static')
      .then((cache) => cache.addAll(REQUIRED_PATHS))
      .then(self.skipWaiting)
  );
});

/**
 * @ignore
 * This is the activation handler. It runs after the worker is installed. It
 * handles the deletion of stale cache responses.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        const expired = keys.filter((key) => !CACHEKEY_REGEXP.test(key));
        const deletions = expired.map((key) => caches.delete(key));
        return Promise.all(deletions);
      })
      .then(self.clients.claim())
  );
});

/**
 * @ignore
 * This is the fetch handler. It runs upon every request, but it only acts upon
 * requests that return true when passed to `isCacheableRequest`. It both
 * serves requests from the cache and adds requests to the cache.
 *
 * This is tricky:
 * https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/match
 * `.match()` does not seem to throw anything when no matching items are found.
 * So instead of using `.catch()` here, we use `.then()` and check the value of
 * response (which could be undefined).
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (isCacheableRequest(request)) {
    event.respondWith(
      caches.match(request).then((response) => {
        // The request was found in the cache; return it.
        if (response instanceof Response) {
          return response;
        }
        // The request wasn't found; add it to (and return it from) the cache.
        return openCache(contentType(request))
          .then((cache) => cache.add(request))
          .then(() => caches.match(request));
      })
    );
  }
});
