'use strict';

/* Directives */

angular.module('gogeo-devguide.directives', []).
  directive('appVersion', ['version',
    function(version) {
      return function(scope, elm, attrs) {
        elm.text(version);
      };
    }]
  );