'use strict';

/* Controllers */

function MapCtrl($rootScope, $scope, services) {
  // Initiate map and base layers (png, cluster, etc)
  $scope.initMap = function() {
    var options = {
      attributionControl: false,
      minZoom: 4,
      maxZoom: 23,
      zoom: 4,
      center: [32.54, -99.49]
    };
    var ggl = new L.Google('ROADMAP', options);

    $scope.map = L.map('map', options);
    $scope.map.addLayer(ggl);

    $scope.createPngLayer();
    $scope.createClusterLayer();
    $scope.group = new L.LayerGroup();
    $scope.group.addTo($scope.map);

    $scope.map.on('zoomend', $scope.addProperLayer);

    $scope.addProperLayer();
  };

  // Choose which layer display
  $scope.addProperLayer = function(event) {
    var zoom = $scope.map.getZoom();
    var zoomToRenderPng = $rootScope.config.zoomToRenderPng;

    // Clear
    $scope.group.clearLayers();

    // Render png points
    if (zoom >= zoomToRenderPng) {
      $scope.group.addLayer($scope.points);
    // Render cluster
    } else {
      $scope.group.addLayer($scope.cluster);
    }
  };

  // Create a cluster layer
  $scope.createClusterLayer = function() {
    var options = {
      maxZoom: 18,
      subdomains: $rootScope.config.subdomains,
      useJsonP: false,
      calculateClusterQtd: function(zoom) {
        if (zoom >= 5) {
          return 2;
        } else {
          return 1;
        }
      }
    };

    var clusterUrl = services.clusterUrl();

    $scope.cluster = L.tileCluster(clusterUrl, options);
  };

  // Create a png layer
  $scope.createPngLayer = function() {
    var database = $rootScope.config.database;
    var collection = $rootScope.config.collection;
    var mapkey = $rootScope.config.mapkey;

    var url = services.pngUrl();

    // create a collection to render png points
    $scope.points = L.tileLayer(url,
      { isBaseLayer: false, subdomains: $rootScope.config.subdomains }
    );
  };
}