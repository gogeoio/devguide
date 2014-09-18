'use strict';

/* Controllers */

function MapCtrl($rootScope, $scope, services) {
  // Global variables
  $rootScope.pngLayer = null; // Our png layer
  $rootScope.cluster = null; // Our cluster layer
  $rootScope.group = new L.LayerGroup(); // Responsible for managing map layers

  $scope.initMap = function() {
    var options = {
      attributionControl: false,
      minZoom: 3,
      maxZoom: 15,
      zoom: 4,
      center: [32.54, -99.49]
    };
    var ggl = new L.Google('ROADMAP', options);

    $rootScope.map = L.map('map', options);
    $rootScope.map.addLayer(ggl);

    $rootScope.group.addTo($rootScope.map);

    $rootScope.points = $scope.createPngLayer();
    $rootScope.cluster = $scope.createClusterLayer();
    $rootScope.group.addTo($rootScope.map);

    $rootScope.map.on('zoomend', $scope.addProperLayer);

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
      $scope.group.addLayer($rootScope.points);
    // Render cluster
    } else {
      $scope.group.addLayer($rootScope.cluster);
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

    return L.tileCluster(clusterUrl, options);
  };

  // Create a png layer
  $scope.createPngLayer = function() {
    var database = $rootScope.config.database;
    var collection = $rootScope.config.collection;
    var mapkey = $rootScope.config.mapkey;

    var url = services.pngUrl();

    // create a collection to render png points
    return L.tileLayer(url,
      { isBaseLayer: false, subdomains: $rootScope.config.subdomains }
    );
  };
}