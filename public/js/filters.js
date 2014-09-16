'use strict';

/* Filters */

angular.module('gogeo-devguide.filters', []).
  filter('interpolate', ['version',
    function(version) {
      return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
      }
    }]
  );