'use strict';

/* Controllers */

function MapCtrl($scope) {
  angular.extend($scope, {
    center: {
      lat: 34,
      lng: -92,
      zoom: 8
    },
    layers: {
      baselayers: {
        googleRoadmap: {
          name: 'Google Streets',
          layerType: 'ROADMAP',
          type: 'google'
        }
      }
    }
  });
}

function NavbarCtrl($scope) {
  $scope.appVersion = '0.1.0';
}