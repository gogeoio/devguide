'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('gogeo-devguide', ['gogeo-devguide.filters', 'gogeo-devguide.services', 'gogeo-devguide.directives','ngRoute']).
  config(
    ['$routeProvider', '$locationProvider',
      function($routeProvider, $locationProvider) {
        $routeProvider.when('/map', {templateUrl: 'partial/1', controller: MapCtrl});
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