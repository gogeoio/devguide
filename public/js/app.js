'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('gogeo-devguide', ['gogeo-devguide.services', 'leaflet-directive', 'ngRoute']).
  config(
    ['$routeProvider', '$locationProvider',
      function($routeProvider, $locationProvider) {
        $routeProvider.when('/map', {controller: MapCtrl});
        $routeProvider.otherwise({redirectTo: '/map'});
        $locationProvider.html5Mode(true);
      }
    ]
  );

app.run(
  function($rootScope, services) {
    services.config(
      function(config) {
        $rootScope.config = config;
        $rootScope.$emit('event:loadLayers');

        $rootScope.styles = [];
        services.getStyles(
          function(styles) {
            $rootScope.styles = styles;
          }
        );
      }
    );
  }
);

app.filter('formatNumber',
  function () {
    return function (text) {
      if (!text) {
        return '';
      }
      text = $.number(parseInt(text), 0, '.', '.');
      return text;
    };
  }
);

app.filter('stringify',
  function () {
    return function (text) {
      if (!text) {
        return '';
      }

      try {
        var parsed = text;

        if (typeof text !== 'object') {
          parsed = JSON.parse(text);
        }

        delete parsed.id;
        delete parsed.$$hashKey;

        var stringify = JSON.stringify(parsed, null, 2);
        return stringify
      } catch (e) {
        return text;
      }
    };
  }
);