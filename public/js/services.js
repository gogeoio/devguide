'use strict';

/* Services */
var app = angular.module('gogeo-devguide.services', []).
  value('version', '0.5.0')
  ;

app.factory('services',
  function($rootScope, $http) {
    return {
      config: function(callback) {
        $http.get('/config').success(callback);
      },
      configureUrl: function(prefix) {
        if (!prefix) {
          prefix = 'maps.';
        }

        var url = $rootScope.config.url;

        if (!_.string.startsWith(url, 'http')) {
          url = 'https://' + prefix + url;
        }

        return url;
      },
      pngUrl: function(style, geom, query) {
        var prefix = null;

        if ($rootScope.config.subdomains) {
          prefix = '{s}.';
        }

        var url = this.configureUrl(prefix);

        var database = $rootScope.config.database;
        var collection = $rootScope.config.collection;
        var mapkey = $rootScope.config.mapkey;

        url = url + '/map/' + database + '/' + collection;
        url = url + '/{z}/{x}/{y}/tile.png';
        url = url + '?mapkey=' + mapkey;

        // That is to not cut the marker.
        url = url + '&buffer=16';

        // Add stylename to URL
        if (style && style !== 'default') {
          url = url + '&stylename=' + style;
        }

        // Add spatial filter to URL
        if (geom) {
          url = url + '&geom=' + JSON.stringify(geom);
        }

        // Add query to URL
        if (query) {
          url = url + '&q=' + JSON.stringify(query);
        }

        // Avoid browser and angular caches
        url = url + '&_=' + Math.random();

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
        // Avoid browser and angular caches
        url = url + '&_=' + Math.random();

        // Add spatial filter to URL
        if (geom) {
          url = url + '&geom=' + JSON.stringify(geom);
        }

        // Add query to URL
        if (query) {
          url = url + '&q=' + JSON.stringify(query);
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
      utfUrl: function(style, geom, query) {
        // URL is the same of tile.png service
        // just replace tile.png by tile.json
        var url = this.pngUrl(style, geom, query);
        url = url.replace('tile.png', 'tile.json');
        url = url + '&key=name';
        url = url + '&fields[]=name';
        url = url + '&callback={cb}';

        return url;
      },
      getStyles: function(callback) {
        var url = this.styleUrl();

        url = url + '?mapkey=' + $rootScope.config.mapkey;
        url = url + '&byName=true';
        // Avoid browser and angular caches
        url = url + '&_=' + Math.random();

        $http.get(url).success(callback);
      },
      publishStyle: function(style, name, callback) {
        if (_.string.isBlank(style)) {
          callback(null);
          return;
        }

        var params = {
          mapkey: $rootScope.config.mapkey,
          name: name,
          carto_css: style
        };

        var url = this.styleUrl();
        $http.post(url, params).success(callback);
      }
    }
  }
);
