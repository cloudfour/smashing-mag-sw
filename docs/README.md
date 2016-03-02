# [smashing-mag-sw](https://github.com/cloudfour/smashing-mag-sw#readme) *0.0.1*




## curry(fn, args) 

Return a curried version of the provided function.




### Parameters

- **fn** `Function`   - The function to be curried
- **args** `mixed`   - Arguments to apply towards the curried function




### Examples

```javascript
const min5 = curry(Math.min, 5); // min5(6) => 5
```
```javascript
const add2 = curry((a, b) => a + b, 2); // add2(3) => 5
```


### Returns


- `Function`   The curried function




## is(constructr, obj) 

Determine if a constructor created an object instance.




### Parameters

- **constructr** `mixed`   - The constructor to test against
- **obj** `mixed`   - The object instance to test against




### Examples

```javascript
is(Request, new Request()); // => true
```
```javascript
is(String, 'hello'); // => true
```
```javascript
is(Number, 42); // => true
```


### Returns


- `Boolean`   




## isPropEq(prop, objs) 

Determine if a number of objects share the same property value.




### Parameters

- **prop** `String` `Number`   - The property name or index
- **objs** `Object` `Array`   - The objects or arrays to compare




### Examples

```javascript
isPropEq('a', {a: 1}, {a: 1, b: 2}); // => true
```
```javascript
isPropEq('origin', url.location, self.location); // => false
```
```javascript
isPropEq(0, [1], [1, 2]); // => true
```


### Returns


- `Boolean`   




## isLocalURL(url) 

Determine if a URL is "local" or not.




### Parameters

- **url** `URL`   - The URL instance to test




### Examples

```javascript
isLocalURL(new URL('http://example.com')); // => false
```


### Returns


- `Boolean`   




## isCacheableURL(url) 

Determine if a URL is "cacheable" or not.




### Parameters

- **url** `URL` `String`   - The URL or string to test




### Examples

```javascript
isCacheableURL(new URL('http://example.com')); // => false
```


### Returns


- `Boolean`   




## isGetRequest(req) 

Determine if a request has a method of "GET" or not.




### Parameters

- **req** `Request`   - The request instance to test




### Examples

```javascript
isGetRequest(new Request('', { method: 'GET' })); // => true
```
```javascript
isGetRequest(new Request('', { method: 'POST' })); // => false
```


### Returns


- `Boolean`   




## getTypeHeader(obj) 

Get the MIME-type of a request or response.




### Parameters

- **obj** `Request` `Response`   - The request or response instance




### Examples

```javascript
getTypeHeader(new Request('style.css')); // => 'text/css'
```


### Returns


- `String`   The MIME-type header value




## contentType(obj) 

Return the content "bucket" type that corresponds with the MIME-type of a
request or response.




### Parameters

- **obj** `Request` `Response`   - The request or response instance




### Examples

```javascript
contentType(new Request('page.html')); // => 'content'
```
```javascript
contentType(new Request('avatar.png')); // => 'image'
```


### Returns


- `String`   The resulting "bucket type"




## isCacheableRequest(request) 

Determine whether or not a request is "cacheable" based on an array of
predicate functions.

TODO: Can this be reduced to an `allPass()` utility?


### Parameters

- **request** `Request`   - The request instance to test




### Examples

```javascript
isCacheableRequest(new Request('logo.svg')); // => true
```
```javascript
isCacheableRequest(new Request('http://example.com')); // => false
```


### Returns


- `Boolean`   




## openCache(args) 

Open a cache with a namedspaced key and return its promise.

The supplied arguments will be combined with the `VERSION` constant to form
a cache key for `caches.open()`.


### Parameters

- **args** `String`   - One or more strings to construct the key value




### Examples

```javascript
openCache('images').then((cache) => {
  // do stuff with cache
});
```


### Returns


- `Promise`   The promise returned by `caches.open()`




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
