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