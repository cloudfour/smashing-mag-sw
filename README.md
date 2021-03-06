## Smashing Magazine Service Worker

This repository is for the early development of a service worker for https://www.smashingmagazine.com.

### Core files

- [serviceWorker.js](serviceWorker.js)
- [serviceWorker-utils.js](serviceWorker-utils.js)

### Online demo

A work-in-progress demo page for basic functionality can be seen at https://cloudfour.github.io/smashing-mag-sw/.

**Notes:** 
- The `https` protocol is required. See [this page](https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features) for more info.
- Be sure to use a [serviceWorker-enabled browser](http://caniuse.com/#feat=serviceworkers).

### Running locally

0. `git clone git@github.com:cloudfour/smashing-mag-sw.git`
0. `cd smashing-mag-sw`
0. `npm install`
0. `npm start`
0. <http://localhost:8080>
