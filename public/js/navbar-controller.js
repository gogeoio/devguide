'use strict';

function NavbarCtrl($scope, $rootScope, services) {
  $scope.appVersion = '0.8.0';

  $rootScope.$on('event:zoomChanged',
    function(event, zoom) {
      $scope.zoom = zoom;
    }
  );

  $rootScope.$on('event:typeChanged',
    function(event, type) {
      $scope.type = type;
    }
  );

  $scope.selectedStyle = null;

  /* ----------------------------------------------------------------------- */
  /*                                                                         */
  /*                                 Styles                                  */
  /*                                                                         */
  /* ----------------------------------------------------------------------- */

  // Change style of layer
  $scope.setLayerStyle = function(style) {
    if (style !== $scope.selectedStyle) {
      $rootScope.$emit('event:changeStyle', style);
      $scope.selectedStyle = style;
    }
  };

  // Function called when click on navbar link
  $scope.applyStyle = function(style) {
    if (style && $rootScope.styles.indexOf(style) == -1) {
      $scope.publishStyle(style);
    } else {
      $scope.setLayerStyle(style);
    }
  };

  // Publish a new style if it has not been yet.
  $scope.publishStyle = function(style) {
    var cartoCss = $scope.getCartoCss(style);
    services.publishStyle(cartoCss, style,
      function(result) {
        if (result) {
          $rootScope.styles.push(style);
          $scope.setLayerStyle(style);
          console.log('Style registered successfully!');
        }
      }
    );
  };

  // Returns CartoCSS corresponding to the kind of style
  $scope.getCartoCss = function(style) {
    var cartoCss = '';
    if (style === 'marker') {
      cartoCss += '#marker {';
      cartoCss += '  point-file: url("http://i.imgur.com/DvyonuW.png");';
      cartoCss += '}';
    } else if (style === 'heat_map') {
      cartoCss += '#heat_map {';
      cartoCss += '   first/marker-fill: #ff0000;'
      cartoCss += '   first/marker-opacity: 0.01;'
      cartoCss += '   first/marker-width: 80;'
      cartoCss += '   first/marker-line-width: 0;'
      cartoCss += '   first/marker-placement: point;'
      cartoCss += '   first/marker-allow-overlap: true;'
      cartoCss += '   first/marker-comp-op: lighten;'
      cartoCss += '';
      cartoCss += '   second/marker-fill: #b30000;'
      cartoCss += '   second/marker-opacity: 0.02;'
      cartoCss += '   second/marker-width:50;'
      cartoCss += '   second/marker-line-width: 0;'
      cartoCss += '   second/marker-placement: point;'
      cartoCss += '   second/marker-allow-overlap: true;'
      cartoCss += '   second/marker-comp-op: lighten;'
      cartoCss += '';
      cartoCss += '   third/marker-fill: #b3002d;'
      cartoCss += '   third/marker-opacity: 0.04;'
      cartoCss += '   third/marker-width:20;'
      cartoCss += '   third/marker-line-width: 0;'
      cartoCss += '   third/marker-placement: point;'
      cartoCss += '   third/marker-allow-overlap: true;'
      cartoCss += '   third/marker-comp-op: lighten;'
      cartoCss += '}';
    }

    return cartoCss;
  };

  /* ----------------------------------------------------------------------- */
  /*                                                                         */
  /*                              Thematic Map                               */
  /*                                                                         */
  /* ----------------------------------------------------------------------- */

  // Create a thematic map
  $scope.createThematicMap = function(type) {

    if (type !== $scope.selectedThematic) {
      if (type === 'blank') {
        $rootScope.$emit('event:toggleLegend', false);
        $rootScope.$emit('event:toggleThematic', false);
        $scope.selectedThematic = null;
      } else {
        $scope.selectedThematic = type;

        if ($rootScope.styles.indexOf(type) == -1) {
          services.createThematicMap(type,
            function(result) {
              $rootScope.$emit('event:toggleLegend', true, type, result.legend);
              $rootScope.$emit('event:toggleThematic', true, type);
            }
          );
        } else {
          $rootScope.$emit('event:toggleLegend', true, type);
          $rootScope.$emit('event:toggleThematic', true, type);
        }
      }
    }
  };

  /* ----------------------------------------------------------------------- */
  /*                                                                         */
  /*                      GeoAggregation and GeoSearch                       */
  /*                                                                         */
  /* ----------------------------------------------------------------------- */

  $scope.geoAgg = false;
  $scope.geoSearch = false;
  
  $rootScope.$on('event:clearGeoServices',
    function(event) {
      $scope.geoSearch = false;
      $scope.geoAgg = false;
    }
  );

  $scope.toggleGeoAgg = function() {
    $scope.geoAgg = !$scope.geoAgg;
    $rootScope.$emit('event:toggleGeoAgg', $scope.geoAgg);

    if ($scope.geoSearch) {
      $scope.geoSearch = !$scope.geoSearch;
      $rootScope.$emit('event:toggleGeoSearch', $scope.geoSearch);
    }
  };

  $scope.toggleGeoSearch = function() {
    $scope.geoSearch = !$scope.geoSearch;
    $rootScope.$emit('event:toggleGeoSearch', $scope.geoSearch);

    if ($scope.geoAgg) {
      $scope.geoAgg = !$scope.geoAgg;
      $rootScope.$emit('event:toggleGeoAgg', $scope.geoAgg);
    }
  };
}