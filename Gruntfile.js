'use strict';

var fs = require('fs');
var path = require('path');

/**
 * Read a directory and return an array of its paths
 */
function dirListing (p) {
  return fs.readdirSync(p).map(function (file) {
    return path.join(p, file);
  }).filter(function (file) {
    return fs.statSync(file).isFile();
  });
}

module.exports = (function (grunt) {
  grunt.loadNpmTasks('grunt-regex-replace');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    "regex-replace": {
      /**
       * Update the contents of serviceWorker-precache.js based on the files
       * present in the assets directory.
       */
      assetPaths: {
        src: ['serviceWorker-precache.js'],
        actions: [
          {
            search: /const REQUIRED_PATHS = \[([\s\S]+)\]/,
            replace: function (match, paths) {
              var newPaths = dirListing('./assets').map(function (path) {
                return '\n  \'' + path + '\'';
              });
              return match.replace(paths, newPaths.join(',') + '\n');
            }
          }
        ]
      }
    }
  });
});
