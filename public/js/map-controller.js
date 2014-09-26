'use strict';

/* Controllers */

function MapCtrl($scope, $rootScope, $timeout, services, leafletData) {

  // Global variables
  $scope.zoom = 11;
  $scope.drawnItems = new L.FeatureGroup();

  // All goGeo layers
  $scope.gogeoLayers = {
    baselayers: {
      googleRoadmap: {
        name: 'Google Streets',
        layerType: 'ROADMAP',
        type: 'google'
      }
    },
    defaults: {
      maxZoom: 18
    },
    overlays: {}
  };

  /* ----------------------------------------------------------------------- */
  /*                                                                         */
  /*                              Draw control                               */
  /*                                                                         */
  /* ----------------------------------------------------------------------- */

  var options = {
    draw: {
      polyline: false, // Turns off this drawing tool
      polygon: false, // Turns off this drawing tool
      circle: false, // Turns off this drawing tool
      rectangle: {
        shapeOptions: {
          clickable: true
        }
      },
      marker: false
    },
    edit: {
      featureGroup: $scope.drawnItems
    },
    thrash: true
  };

  var drawControl = new L.Control.Draw(options);

  leafletData.getMap().then(
    function(map) {
      map.addLayer($scope.drawnItems);

      // Update geom and reload layers
      map.on('draw:created', $scope.drawHandler);
      map.on('draw:edited', $scope.drawHandler);
      map.on('draw:deleted',
        function() {
          $scope.newGeom = null;
          $scope.drawnItems.clearLayers();
          $scope.handleLayers($scope.zoom);
        }
      );
    }
  );

  $scope.drawHandler = function(event) {

    var layer = event.layer;

    if (layer) {
      $scope.drawnItems.clearLayers();
      $scope.drawnItems.addLayer(layer);
    } else {
      layer = $scope.drawnItems.getLayers()[0];
    }

    var geojson = layer.toGeoJSON();

    $scope.newGeom = JSON.stringify(geojson.geometry);
    $scope.handleLayers($scope.zoom);
  };

  // Add baselayer
  angular.extend($scope, {
    center: {
      lat: 34,
      lng: -92,
      zoom: $scope.zoom
    },
    layers: $scope.gogeoLayers,
    controls: {
      custom: [ drawControl ]
    }
  });

  // Create a cluster layer
  $scope.createClusterLayer = function(geom, query) {
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

    var clusterUrl = services.clusterUrl(geom, query);
    return L.tileCluster(clusterUrl, options);
  };

  /* ----------------------------------------------------------------------- */
  /*                                                                         */
  /*                                 Events                                  */
  /*                                                                         */
  /* ----------------------------------------------------------------------- */

  // Handle mouseover event
  $scope.$on('leafletDirectiveMap.utfgridMouseover',
    function(event, leafletEvent) {
      // the UTFGrid information is on leafletEvent.data
      leafletData.getMap().then(
        function(map) {
          if (leafletEvent.data) {
            var content = '<h3>' + leafletEvent.data.name + '</h3>';
            $scope.popup = L.popup()
              .setLatLng(leafletEvent.latlng)
              .setContent(content)
              .openOn(map);
          }
        }
      );
    }
  );

  $scope.$on('leafletDirectiveMap.utfgridMouseout',
    function(event, leafletEvent) {
      leafletData.getMap().then(
        function(map) {
          map.closePopup();
        }
      );
    }
  );

  // Event call when is to load the other layers
  $rootScope.$on('event:loadLayers',
    function(event) {
      // Show the proper layer based on zoom level
      $scope.$watch('center.zoom',
        function(zoom) {
          $scope.handleLayers(zoom);
          // Send the new zoom to NavbarCtrl
          $rootScope.$emit('event:zoomChanged', zoom);
        }
      );
    }
  );

  // Event call when style is changed
  $rootScope.$on('event:changeStyle',
    function(event, newStyle, oldStyle) {
      $scope.newStyle = newStyle;
      $scope.handleLayers($scope.zoom);
    }
  );

  // Event call when query is changed
  $rootScope.$on('event:queryChanged',
    function(event, query) {
      $scope.newQuery = query;
      $scope.handleLayers($scope.zoom);
    }
  );

  // Check what layer display
  $scope.handleLayers = function(zoom) {
    if (zoom) {
      $scope.zoom = zoom;
    }

    var overlays = $scope.gogeoLayers.overlays;

    if ($scope.zoom >= $rootScope.config.zoomToRenderPng) {
      $scope.removeClusterLayer();
      $scope.createPointsLayer();
    } else {
      $scope.removePngAndUtfLayers();

      // goGeo Cluster Layer
      if (!overlays.cluster) {
        overlays.cluster = {
          name: 'goGeo Cluster Layer',
          type: 'custom',
          layer: $scope.createClusterLayer($scope.geom, $scope.query),
          visible: true
        };

        $rootScope.$emit('event:typeChanged', 'cluster');
      } else if ($scope.geom !== $scope.newGeom || $scope.query !== $scope.newQuery) {
        $scope.removeClusterLayer();
        $scope.geom = $scope.newGeom;
        $scope.query = $scope.newQuery;

        var types = ['cluster'];

        if ($scope.query) {
          types.push('query');
        }

        if ($scope.geom) {
          types.push('geom');
        }

        $rootScope.$emit('event:typeChanged', types.join(' + '));

        $timeout(
          function() {
            overlays.cluster = {
              name: 'goGeo Cluster Layer - ' + types.join(' + '),
              type: 'custom',
              layer: $scope.createClusterLayer($scope.geom, $scope.query),
              visible: true
            };
          },
          100
        );
      }
    }
  };

  $scope.removeClusterLayer = function() {
    var overlays = $scope.gogeoLayers.overlays;

    if (overlays.cluster) {
      delete overlays.cluster;
    }
  };

  $scope.removePngAndUtfLayers = function() {
    var overlays = $scope.gogeoLayers.overlays;

    // Remove png and utfgrid layers
    if (overlays.utfgrid) {
      delete overlays.utfgrid;
    }
    if (overlays.points) {
      delete overlays.points;
    }
  };

  $scope.createPointsLayer = function() {
    var overlays = $scope.gogeoLayers.overlays;

    if (!overlays.points
      || $scope.newStyle !== $scope.style
      || $scope.newGeom !== $scope.geom
      || $scope.newQuery !== $scope.query) {

      $scope.removePngAndUtfLayers();

      var pngName = 'goGeo Png Layer';
      var utfName = 'goGeo UTFGrid Layer';
      var timeout = 0;

      $rootScope.$emit('event:typeChanged', 'png + utfgrid');

      $scope.style = $scope.newStyle;
      $scope.geom = $scope.newGeom;
      $scope.query = $scope.newQuery;

      var types = ['png', 'utfgrid'];

      if ($scope.style) {
        types.push($scope.style);
        timeout = 10;
      }

      if ($scope.geom) {
        types.push('geom');
        timeout = 10;
      }

      if ($scope.query) {
        types.push('query');
      }

      if (types.length > 2) {
        $rootScope.$emit('event:typeChanged', types.join(' + '));
        pngName = pngName + ' - ' + types.join(' + ');
        utfName = utfName + ' - ' + types.join(' + ');
      }

      $timeout(
        function() {
          overlays.points = {
            name: pngName,
            url: services.pngUrl($scope.style, $scope.geom, $scope.query),
            type: 'xyz',
            visible: true
          };

          overlays.utfgrid = {
            name: utfName,
            url: services.utfUrl($scope.style, $scope.geom, $scope.query),
            type: 'utfGrid',
            visible: true
          };
        }
      );
    }
  }
}