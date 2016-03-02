'use strict';

self.importScripts(
  'serviceWorker-utils.js',
  'serviceWorker-precache.js'
);

/*!
 * This is the version tag for this service worker file. Its value is used as a
 * prefix for all cache keys. For example, the cache key for image responses
 * might be named "0.0.1-images". When this worker is activated, all of the
 * cache keys not prefixed with this exact version will be assumed "outdated"
 * and deleted.
 */
const VERSION = '0.0.3';

/*!
 * This is a map of regular expressions. The keys represent cache "buckets" for
 * generalized content types. The values are regular expressions that must match
 * against request MIME-types to determine whether or not they belong in the
 * corresponding bucket.
 *
 * TODO: Make these values real.
 */
const BUCKET_PATTERNS = {
  static: /^(text|application)\/(css|javascript)/,
  image: /^image\//,
  content: /^text\/(html|xml|xhtml)/
};

/*!
 * This is a shortcut to access the bucket types as an array.
 */
const BUCKET_KEYS = Object.keys(BUCKET_PATTERNS);

/*!
 * This is the delimiter used for joining cache key segments.
 */
const CACHEKEY_DELIM = '-';

/*!
 * This is the regular expression used to check the validity of cache keys.
 *
 * CACHEKEY_REGEXP.toString(); // => '/(0\.0\.1)-(static|image|content)(-.+)?/'
 */
const CACHEKEY_REGEXP = new RegExp([
  `(${VERSION.replace(/(\W)/g, '\\$1')})`,
  CACHEKEY_DELIM,
  `(${BUCKET_KEYS.join('|')})`,
  `(${CACHEKEY_DELIM}.+)?`
].join(''));

/*!
 * This is the regular expression used to determine whether or not a request
 * should be handled by the `fetch` event handler.
 *
 * TODO: Make this value real.
 */
const CACHEABLE_REGEX = /(page[1-2]\.html)$/;

/**
 * Determine if a URL is "local" or not.
 *
 * @param {URL} url - The URL instance to test
 * @return {Boolean}
 * @example isLocalURL(new URL('http://example.com')); // => false
 */
const isLocalURL = curry(isPropEq, 'origin', self.location);

/**
 * Determine if a URL is "cacheable" or not.
 *
 * @param {URL|String} url - The URL or string to test
 * @return {Boolean}
 * @example isCacheableURL(new URL('http://example.com')); // => false
 */
const isCacheableURL = (url) => CACHEABLE_REGEX.test(url);

/**
 * Determine if a request has a method of "GET" or not.
 *
 * @param {Request} req - The request instance to test
 * @return {Boolean}
 * @example isGetRequest(new Request('', { method: 'GET' })); // => true
 * @example isGetRequest(new Request('', { method: 'POST' })); // => false
 */
const isGetRequest = (req) => req.method === 'GET';

/**
 * Get the MIME-type of a request or response.
 *
 * @param {Request|Response} obj - The request or response instance
 * @return {String} The MIME-type header value
 * @example getTypeHeader(new Request('style.css')); // => 'text/css'
 */
const getTypeHeader = (obj) => {
  switch (obj.constructor) {
    case Request: return obj.headers.get('Accept');
    case Response: return obj.headers.get('Content-Type');
    default: break;
  }
};

/**
 * Return the content "bucket" type that corresponds with the MIME-type of a
 * request or response.
 *
 * @param {Request|Response} obj - The request or response instance
 * @return {String} The resulting "bucket type"
 * @example contentType(new Request('page.html')); // => 'content'
 * @example contentType(new Request('avatar.png')); // => 'image'
 */
const contentType = (obj) => {
  const typeHeader = getTypeHeader(obj);
  return BUCKET_KEYS.find((name) => BUCKET_PATTERNS[name].test(typeHeader));
};

/**
 * Determine whether or not a request is "cacheable" based on an array of
 * predicate functions.
 *
 * TODO: Can this be reduced to an `allPass()` utility?
 *
 * @param {Request} request - The request instance to test
 * @return {Boolean}
 * @example isCacheableRequest(new Request('logo.svg')); // => true
 * @example isCacheableRequest(new Request('http://example.com')); // => false
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
 * Open a cache with a namedspaced key and return its promise.
 *
 * The supplied arguments will be combined with the `VERSION` constant to form
 * a cache key for `caches.open()`.
 *
 * @param {...String} args - One or more strings to construct the key value
 * @return {Promise} The promise returned by `caches.open()`
 * @example
 * openCache('images').then((cache) => {
 *   // do stuff with cache
 * });
 */
const openCache = (...args) => {
  const key = [VERSION].concat(args).join(CACHEKEY_DELIM);
  return caches.open(key);
};

/*!
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

/*!
 * This is the activation handler. It runs after the worker is installed. It
 * handles the deletion of stale cache responses.
 *
 * TODO: Why do we invalidate the caches here instead of during the install?
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

/*!
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
        if (is(Response, response)) {
          return response;
        } else {
          // The request wasn't found; add it to (and return it from) the cache.
          return openCache(contentType(request))
            .then((cache) => cache.add(request))
            .then(() => caches.match(request));
        }
      })
    );
  }
});
