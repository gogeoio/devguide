'use strict';

/* Controllers */

function MapCtrl($scope, $rootScope, $timeout, services) {

  // Global variables
  $scope.overlays = {}; // Overlays
  $scope.zoom = 8;

  // All goGeo layers
  $scope.gogeoLayers = {
    baselayers: {
      googleRoadmap: {
        name: 'Google Streets',
        layerType: 'ROADMAP',
        type: 'google'
      }
    },
    overlays: $scope.overlays
  };

  // Add baselayer
  angular.extend($scope, {
    center: {
      lat: 34,
      lng: -92,
      zoom: $scope.zoom
    },
    controls: {},
    layers: $scope.gogeoLayers
  });

  // Event call when is to load the other layers
  $rootScope.$on('event:loadLayers',
    function(event) {
      // Show the proper layer based on zoom level
      $scope.$watch('center.zoom',
        function(zoom) {
          $scope.handleLayers(zoom);
        }
      );
    }
  );

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

  // Event call when style is changed
  $rootScope.$on('event:changeStyle',
    function(event, newStyle, oldStyle) {
      $scope.handleLayers($scope.zoom, newStyle, oldStyle);
    }
  );

  // Check what layer display
  $scope.handleLayers = function(zoom, style, oldStyle) {
    if (zoom) {
      $scope.zoom = zoom;
    }

    if ($scope.zoom >= $rootScope.config.zoomToRenderPng) {
      // Hide cluster layer
      if ($scope.overlays.cluster) {
        // Timeout to prevent the cluster layer is not removed
        $timeout(
          function() {
            $scope.overlays.cluster.visible = false;
          },
          250
        );
      }

      // Check if the previous layer is created and then change to not visible
      if ($scope.overlays[oldStyle]) {
        $scope.overlays[oldStyle].visible = false;
      }

      // Check whether to show the layer with style
      if (style) {
        // Hide layer of points
        $scope.overlays.points.visible = false;

        if (!$scope.overlays[style]) {
          // Create layer with style
          $scope.overlays[style] = {
            name: 'goGeo Png Layer - ' + style,
            url: services.pngUrl(style),
            type: 'xyz',
            visible: true
          }
        } else {
          // Show layer with style
          $scope.overlays[style].visible = true;
        }
      } else {
        // goGeo Points Layer
        if (!$scope.overlays.points) {
          $scope.overlays.points = {
            name: 'goGeo Png Layer',
            url: services.pngUrl(),
            type: 'xyz',
            visible: true
          };
        } else {
          $scope.overlays.points.visible = true;
        }
      }
    } else {
      // Hide png layer
      if ($scope.overlays.points) {
        $scope.overlays.points.visible = false;
      }

      // goGeo Cluster Layer
      if (!$scope.overlays.cluster) {
        $scope.overlays.cluster = {
          name: 'goGeo Cluster Layer',
          type: 'custom',
          layer: $scope.createClusterLayer(),
          visible: true
        }
      } else {
        $scope.overlays.cluster.visible = true;
      }
    }
  };
}