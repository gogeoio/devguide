'use strict';

/* Controllers */

function MapCtrl($scope, $services) {
  $scope.initMap = function() {
    var options = {
      attributionControl: false,
      minZoom: 4,
      maxZoom: 14,
      zoom: 4,
      center: [32.54, -99.49],
      maxBounds: [
        [84.67351256610522, -174.0234375],
        [-57.13, 83.32]
      ]
    };
    var ggl = new L.Google('ROADMAP', options);

    $scope.map = L.map('map', options);
    $scope.map.addLayer(ggl);

    $scope.addLayerPoints($services);
  }

  $scope.addLayerPoints = function() {
    $scope.map
  }
}