'use strict';

/* Controllers */

function MapCtrl($rootScope, $scope, $timeout, services) {
  // Global variables
  $rootScope.selectedLayer = null;
  $rootScope.selectedStyle = null;
  $rootScope.newStyle = 'default';
  $rootScope.pngLayer = null; // Our png layer
  $rootScope.cluster = null; // Our cluster layer
  $rootScope.utfgridLayer = null; // UTFGrid layer
  $rootScope.group = new L.LayerGroup(); // Responsible for managing map layers
  $rootScope.geom = null; // Spatial filter
  $rootScope.query = null; // Relational filter

  $scope.initMap = function() {
    var options = {
      attributionControl: false,
      minZoom: 3,
      maxZoom: 15,
      zoom: 15,
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
    $scope.addControls();

    var queryControl = $scope.relationalFilterControler();
    $rootScope.map.addControl(new queryControl());
  };

  // Return if styles was changed
  $scope.styleChanged = function() {
    return $rootScope.selectedStyle !== $rootScope.newStyle;
  };

  // Choose which layer display (png or cluster)
  $scope.addProperLayer = function(event) {
    $rootScope.zoom = $rootScope.map.getZoom();
    $rootScope.zoomToRenderPng = $rootScope.config.zoomToRenderPng;

    var geomHasChanged = false;
    if ($rootScope.geom != $rootScope.newGeom) {
      $rootScope.geom = $rootScope.newGeom;
      geomHasChanged = true;
    }

    var queryHasChanged = false;
    if (JSON.stringify($rootScope.query) !== JSON.stringify($rootScope.newQuery)) {
      $rootScope.query = $rootScope.newQuery;
      queryHasChanged = true;
    }

    // Render png points
    if ($scope.zoom >= $scope.zoomToRenderPng) {
      if ($rootScope.selectedStyle === 'cluster' ||
        $scope.styleChanged() || geomHasChanged || queryHasChanged) {

        $rootScope.group.clearLayers();
        $rootScope.selectedStyle = $rootScope.newStyle;

        $rootScope.utfgridLayer = $scope.createUtfgridLayer($rootScope.selectedStyle);
        $rootScope.group.addLayer($scope.utfgridLayer);
        $scope.addUtfgridBehavior();

        $rootScope.selectedLayer = $scope.createPngLayer($rootScope.selectedStyle);
        $rootScope.group.addLayer($rootScope.selectedLayer);
      }
    // Render cluster
    } else if ($rootScope.selectedStyle !== 'cluster' ||
      geomHasChanged || queryHasChanged) {

      $rootScope.group.clearLayers();
      $scope.cluster = $scope.createClusterLayer();
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

    var clusterUrl = services.clusterUrl($rootScope.geom, $rootScope.query);

    return L.tileCluster(clusterUrl, options);
  };

  // Create a png layer
  $scope.createPngLayer = function(style) {
    var url = services.pngUrl(style, $rootScope.geom, $rootScope.query);

    // create a collection to render png points
    return L.tileLayer(url,
      { isBaseLayer: false, subdomains: $rootScope.config.subdomains }
    );
  };

  // Create a UTFGrid layer
  $scope.createUtfgridLayer = function(style) {
    var url = services.utfUrl(style, $rootScope.geom, $rootScope.query);

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

  // Add controls to draw tool
  $scope.addControls = function() {
    $rootScope.editableLayers = new L.FeatureGroup();
    $rootScope.map.addLayer($rootScope.editableLayers);

    var options = {
      position: 'topleft',
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
      edit: false,
      thrash: true
    };

    var drawControl = new L.Control.Draw(options);
    $rootScope.map.addControl(drawControl);

    $scope.addResetButton();

    $rootScope.map.on('draw:created',
      function(e) {
        var type = e.layerType,
            layer = e.layer;

        $rootScope.editableLayers.addLayer(layer);

        var geojson = $rootScope.editableLayers.toGeoJSON();
        $rootScope.newGeom = geojson.features[0].geometry;

        $scope.addProperLayer();

        $scope.toggleResetButton(true);
      }
    );

    $rootScope.map.on('draw:drawstart',
      function(e) {
        $rootScope.editableLayers.clearLayers();
      }
    );
  };

  // Add trash icon to reset spatial filter
  $scope.addResetButton = function() {
    var resetButton = document.createElement('a');
    
    resetButton.setAttribute('id', 'resetButton');
    resetButton.setAttribute('class', 'leaflet-draw-edit-remove leaflet-disabled');
    resetButton.setAttribute('href', '#');
    resetButton.setAttribute('title', 'Reset area');

    var drawToolbar = $('.leaflet-draw-toolbar.leaflet-bar.leaflet-draw-toolbar-top');
    drawToolbar.append(resetButton);

    $('#resetButton').on('click',
      function(event) {
        $rootScope.editableLayers.clearLayers();
        $scope.toggleResetButton(false);
        $rootScope.newGeom = null;
        $scope.addProperLayer();
        event.preventDefault();
        return;
      }
    );
  };

  // Change class trash icon
  $scope.toggleResetButton = function(enable) {
    if (enable) {
      $('#resetButton').prop('class', 'leaflet-draw-edit-remove');
    } else {
      $('#resetButton').prop('class', 'leaflet-draw-edit-remove leaflet-disabled');
    }
  };

  // Add custom control to relation query
  $scope.relationalFilterControler = function() {
    return L.Control.extend({
      options: {
        position: 'topright',
        searchExample: {
          query: {
            match_all: {

            }
          }
        }
      },

      initialize: function(options) {
        L.Util.setOptions(this, options || {});
      },
      onAdd: function (map) {
        // Create a div to textarea
        this._container = L.DomUtil.create('div', 'leaflet-control-search');
        // Create textarea to search
        this._textarea = this._createInput();
        // Create a button to update map
        this._searchButton = this._createButton();

        return this._container;
      },
      search: function() {
        try {
          $rootScope.newQuery = JSON.parse(this._textarea.value);
        } catch(e) {
          console.error('Error', e);
          $rootScope.newQuery = null;
        }
        $scope.addProperLayer();
      },
      _createButton: function() {
        var div = this._createDiv('row-fluid');
        this._button_div = L.DomUtil.create('div', 'col-md-2 col-md-offset-4', div);
        var button = L.DomUtil.create('button', 'btn-primary small', this._button_div);

        button.id = 'searchButton';
        button.type = 'button';
        button.style['margin-bottom'] = '8px';

        $timeout(
          function() {
            $('#searchButton').html('Search');
          }
        );

        L.DomEvent
          .on(button, 'click', L.DomEvent.stop, this)
          .on(button, 'click', this.search, this);

        return button;
      },
      _createDiv: function(className) {
        var div = L.DomUtil.create('div', className, this._container);
        div.style.display = 'relative';
        div.style.padding = '5px';

        return div;
      },
      _createInput: function () {
        this._search_div = this._createDiv('row-fluid');
        var input = L.DomUtil.create('textarea', '', this._search_div);
        input.rows = 10;
        input.cols = 40;
        input.autocomplete = 'off';
        input.autocorrect = 'off';
        input.autocapitalize = 'off';
        input.value = JSON.stringify(this.options.searchExample, null, 2);
        input.style.display = 'relative';

        L.DomEvent
          .disableClickPropagation(input)
          ;
        
        return input;
      }
    });
  };
}