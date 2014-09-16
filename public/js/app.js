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

app.factory('services',
  function($rootScope, $http) {
    return {
      config: {
        'apikey': 'cc4fb567-66aa-4206-8e51-401954da86c1',
        'mapkey': '7252e0f7-c0f0-4c0b-98eb-c37fc4a5effa',
        'collection': '50k_empresas04'
      }
    }
  }
);