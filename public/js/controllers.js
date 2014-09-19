'use strict';

/* Controllers */

function MapCtrl($rootScope, $scope, services) {
  // Global variables
  $rootScope.selectedLayer = null;
  $rootScope.selectedStyle = null;
  $rootScope.newStyle = 'default';
  $rootScope.pngLayer = null; // Our png layer
  $rootScope.cluster = null; // Our cluster layer
  $rootScope.utfgridLayer = null; // UTFGrid layer
  $rootScope.group = new L.LayerGroup(); // Responsible for managing map layers

  $scope.initMap = function() {
    var options = {
      attributionControl: false,
      minZoom: 3,
      maxZoom: 15,
      zoom: 10,
      center: [34.735150, -92.299475]
    };
    var ggl = new L.Google('ROADMAP', options);

    $rootScope.map = L.map('map', options);
    $rootScope.map.addLayer(ggl);

    $rootScope.group.addTo($rootScope.map);

    $rootScope.pngLayer = $scope.createPngLayer();
    $rootScope.cluster = $scope.createClusterLayer();
    $rootScope.group.addTo($rootScope.map);

    $rootScope.map.on('zoomend', $scope.addProperLayer);

    $scope.addProperLayer();
  };

  // Choose which layer display (png or cluster)
  $scope.addProperLayer = function(event) {
    $rootScope.zoom = $rootScope.map.getZoom();
    $rootScope.zoomToRenderPng = $rootScope.config.zoomToRenderPng;

    // Render png points
    if ($scope.zoom >= $scope.zoomToRenderPng) {
      if ($rootScope.selectedStyle === 'cluster' || $rootScope.selectedStyle !== $rootScope.newStyle) {
        $rootScope.group.clearLayers();
        $rootScope.selectedStyle = $rootScope.newStyle;

        $rootScope.utfgridLayer = $scope.createUtfgridLayer($rootScope.selectedStyle);
        $rootScope.group.addLayer($scope.utfgridLayer);
        $scope.addUtfgridBehavior();

        $rootScope.selectedLayer = $scope.createPngLayer($rootScope.selectedStyle);
        $rootScope.group.addLayer($rootScope.selectedLayer);
      }
    // Render cluster
    } else if ($rootScope.selectedStyle !== 'cluster') {
      $rootScope.group.clearLayers();
      $rootScope.selectedLayer = $scope.cluster;
      $rootScope.selectedStyle = 'cluster';
      $rootScope.group.addLayer($rootScope.selectedLayer);
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
  $scope.createPngLayer = function(style) {
    var url = services.pngUrl(style);

    // create a collection to render png points
    return L.tileLayer(url,
      { isBaseLayer: false, subdomains: $rootScope.config.subdomains }
    );
  };

  // Create a UTFGrid layer
  $scope.createUtfgridLayer = function(style) {
    var url = services.utfUrl(style);

    var options = {
      useJsonP: true,
      // goGeo UTFGrids don't work well with other resolution
      resolution: 4,
      subdomains: $rootScope.config.subdomains
    };

    return new L.UtfGrid(url, options);
  };

  $scope.addUtfgridBehavior = function() {
    // Show data name in mouseover event
    $rootScope.utfgridLayer.on('mouseover',
      function (e) {
        if (e.data) {
          var content = '<h3>' + e.data.name + '</h3>';
          var popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(content)
            .openOn($rootScope.map);
        }
      }
    );

    // Close popup in mouseout event
    $rootScope.utfgridLayer.on('mouseout',
      function(e) {
        $rootScope.map.closePopup();
      }
    );
  };

  // Change style of layer
  $scope.setLayerStyle = function(style) {
    $rootScope.newStyle = style;
    $scope.addProperLayer();
  };

  // Function called when click on navbar link
  $scope.applyStyle = function(type) {
    if ($rootScope.styles.indexOf(type) == -1) {
      $scope.publishStyle(type);
    } else {
      $scope.setLayerStyle(type);
    }
  };

  // Publish a new style if it has not been yet.
  $scope.publishStyle = function(type) {
    var style = $scope.getStyle(type);
    services.publishStyle(style, type,
      function(result) {
        if (result) {
          $rootScope.styles.push(type);
          $scope.setLayerStyle(type);
          console.log('Style registered successfully!');
        }
      }
    );
  };

  // Returns CartoCSS corresponding to the kind of style
  $scope.getStyle = function(type) {
    var style = '';
    if (type === 'marker') {
      style += '#marker {';
      style += '  point-file: url("http://i.imgur.com/DvyonuW.png");';
      style += '}';
    } else if (type === 'heat_map') {
      style += '#heat_map {';
      style += '   first/marker-fill: #ff0000;'
      style += '   first/marker-opacity: 0.01;'
      style += '   first/marker-width: 80;'
      style += '   first/marker-line-width: 0;'
      style += '   first/marker-placement: point;'
      style += '   first/marker-allow-overlap: true;'
      style += '   first/marker-comp-op: lighten;'
      style += '';
      style += '   second/marker-fill: #b30000;'
      style += '   second/marker-opacity: 0.02;'
      style += '   second/marker-width:50;'
      style += '   second/marker-line-width: 0;'
      style += '   second/marker-placement: point;'
      style += '   second/marker-allow-overlap: true;'
      style += '   second/marker-comp-op: lighten;'
      style += '';
      style += '   third/marker-fill: #b3002d;'
      style += '   third/marker-opacity: 0.04;'
      style += '   third/marker-width:20;'
      style += '   third/marker-line-width: 0;'
      style += '   third/marker-placement: point;'
      style += '   third/marker-allow-overlap: true;'
      style += '   third/marker-comp-op: lighten;'
      style += '}';
    }

    return style;
  };
}