'use strict';

/* Services */

var app = angular.module('gogeo-devguide.services', []);

app.factory('services',
  function($rootScope, $http) {
    return {
      config: function(callback) {
        $http.get('/config').success(callback);
      },
      configureUrl: function(prefix) {
        var url = $rootScope.config.url;

        if (!prefix) {
          prefix = 'maps.';
        }

        if (!_.string.startsWith(url, 'https')) {
          url = 'https://' + prefix + url;
        }

        return url;
      },
      pngUrl: function(collection, style, geom, query) {
        var prefix = null;

        if ($rootScope.config.subdomains && $rootScope.config.subdomains.length > 0) {
          prefix = '{s}.';
        }

        var url = this.configureUrl(prefix);

        var database = $rootScope.config.database;
        // var collection = $rootScope.config.collection;
        var mapkey = $rootScope.config.mapkey;

        url = url + '/map/' + database + '/' + collection;
        url = url + '/{z}/{x}/{y}/tile.png';
        url = url + '?mapkey=' + mapkey;

        // That is to not cut the marker.
        url = url + '&buffer=8';

        // Add style to URL
        if (style) {
          url = url + '&stylename=' + style;
        }

        // Prevent angular cache
        url = url + '&_=' + Math.random();

        // Add geom to URL
        if (geom) {
          url = url + '&geom=' + geom;
        }

        if (query) {
          url = url + '&q=' + query;
        }

        return url;
      },
      clusterUrl: function(geom, query) {
        var url = this.configureUrl();

        var database = $rootScope.config.database;
        var collection = $rootScope.config.collection;
        var mapkey = $rootScope.config.mapkey;

        url = url + '/map/' + database + '/' + collection;
        url = url + '/{z}/{x}/{y}/cluster.json';
        url = url + '?mapkey=' + mapkey;

        // Prevent angular cache
        url = url + '&_=' + Math.random();

        // Add geom to URL
        if (geom) {
          url = url + '&geom=' + geom;
        }

        if (query) {
          url = url + '&q=' + query;
        }

        return url;
      },
      styleUrl: function() {
        var url = this.configureUrl();

        var database = $rootScope.config.database;
        var collection = $rootScope.config.collection;

        url = url + '/styles/' + database + '/' + collection;

        return url;
      },
      utfUrl: function(collection, style, geom, query) {
        // URL is the same of tile.png service
        // just replace tile.png by tile.json
        var url = this.pngUrl(collection, style, geom, query);
        url = url.replace('tile.png', 'tile.json');
        url = url + '&key=name';
        url = url + '&fields[]=name';
        url = url + '&callback={cb}';

        return url;
      },
      thematicUrl: function() {
        var url = this.configureUrl();

        var database = $rootScope.config.database;
        var collection = $rootScope.config.thematicCollection;

        url = url + '/thematic/' + database + '/' + collection;
        url = url + '?mapkey=' + $rootScope.config.mapkey;

        return url;
      },
      getStyles: function(callback) {
        var url = this.styleUrl();

        url = url + '?mapkey=' + $rootScope.config.mapkey;
        url = url + '&byName=true';

        // Prevent angular cache
        url = url + '&_=' + Math.random();

        $http.get(url).success(callback);
      },
      publishStyle: function(cartoCss, name, callback) {
        if (_.string.isBlank(cartoCss)) {
          callback(null);
          return;
        }

        var params = {
          mapkey: $rootScope.config.mapkey,
          name: name,
          carto_css: cartoCss
        };

        var url = this.styleUrl();
        $http.post(url, params).success(callback);
      },
      createThematicMap: function(type, callback) {
        var url = this.thematicUrl();

        var params = {
          mapkey: $rootScope.config.mapkey,
          name: type,
          column: type
        };

        $http.post(url, params).success(callback);
      }
    }
  }
);