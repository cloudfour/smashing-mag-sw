/**
 * @ignore
 */
'use strict';

self.importScripts(
  'serviceWorker-utils.js',
  'serviceWorker-precache.js'
);

/**
 * This is the version tag for this service worker file. Its value is used as a
 * prefix for all cache keys. For example, the cache key for image responses
 * might be named "0.0.1-images". When this worker is activated, all of the
 * cache keys not prefixed with this exact version will be assumed "outdated"
 * and deleted.
 */
const VERSION = '0.0.1';

/**
 * This is a map of regular expressions. The keys represent cache "buckets" for
 * generalized content types. The values are regular expressions that must match
 * against request MIME-types to determine whether or not they belong in the
 * corresponding bucket.
 *
 * TODO: Make these values real.
 *
 * @example
 * BUCKET_PATTERNS['image'].test('application/json'); // => false
 */
const BUCKET_PATTERNS = {
  static: /^(text|application)\/(css|javascript)/,
  image: /^image\//,
  content: /^text\/(html|xml|xhtml)/
};

/**
 * This is a shortcut to access the bucket types as an array.
 */
const BUCKET_KEYS = Object.keys(BUCKET_PATTERNS);

/**
 * This is the delimiter used for joining cache key segments.
 */
const CACHEKEY_DELIM = '-';

/**
 * This is the regular expression used to check the validity of cache keys.
 *
 * @example
 * CACHEKEY_REGEXP.toString(); // => '/(0\.0\.1)-(static|image|content)(-.+)?/'
 */
const CACHEKEY_REGEXP = new RegExp([
  `(${VERSION.replace(/(\W)/g, '\\$1')})`,
  CACHEKEY_DELIM,
  `(${BUCKET_KEYS.join('|')})`,
  `(${CACHEKEY_DELIM}.+)?`
].join(''));

/**
 * This is the regular expression used to determine whether or not a request
 * should be handled by the `fetch` event handler.
 *
 * TODO: Make this value real.
 */
const CACHEABLE_REGEX = /(page[1-2]\.html)$/;

/**
 * Determine if a URL is "local" or not.
 *
 * @param {URL} url
 * @return {Boolean}
 * @example
 * isLocalURL(new URL('http://example.com')); // => false
 */
const isLocalURL = curry(isPropEq, 'origin', self.location);

/**
 * Determine if a URL is "cacheable" or not.
 *
 * @param {URL|String} url
 * @return {Boolean}
 * @example
 * isCacheableURL(new URL('http://example.com')); // => false
 */
const isCacheableURL = (url) => CACHEABLE_REGEX.test(url);

/**
 * Determine if a request has a method of "GET" or not.
 *
 * @param {Request} req
 * @return {Boolean}
 * @example
 * isGetRequest(new Request('', { method: 'GET' })); // => true
 */
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
