'use strict';

/* Controllers */


function MapCtrl($scope, $rootScope, $timeout, services) {

  // Global variables
  $scope.overlays = {}; // Overlays
  $scope.zoom = 10;

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

    var clusterUrl = services.clusterUrl($rootScope.geom, $rootScope.query);

    return L.tileCluster(clusterUrl, options);
  };

  $scope.handleLayers = function(zoom) {
    $scope.zoom = zoom;

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

      // goGeo Points Layer
      if ($scope.overlays.points) {
        $scope.overlays.points.visible = true;
      } else {
        $scope.overlays.points = {
          name: 'goGeo Png Layer',
          url: services.pngUrl(),
          type: 'xyz',
          visible: true
        };
      }
    } else {
      // Hide png layer
      if ($scope.overlays.points) {
        $scope.overlays.points.visible = false;
      }
      // goGeo Cluster Layer
      if ($scope.overlays.cluster) {
        $scope.overlays.cluster.visible = true;
      } else {
        $scope.overlays.cluster = {
          name: 'goGeo Cluster Layer',
          type: 'custom',
          layer: $scope.createClusterLayer(),
          visible: true
        }
      }
    }
  };
}

function NavbarCtrl($scope) {
  $scope.appVersion = '0.1.0';
}