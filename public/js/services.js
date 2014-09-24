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
      pngUrl: function(style) {
        var prefix = null;

        if ($rootScope.config.subdomains && $rootScope.config.subdomains.length > 0) {
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
        url = url + '&_=' + Math.random();

        if (style && style !== 'default') {
          url = url + '&stylename=' + style;
        }

        // Prevent angular cache
        url = url + '&_=' + Math.random();

        // Add style to URL
        if (style) {
          url = url + '&stylename=' + style;
        }

        return url;
      },
      clusterUrl: function() {
        var url = this.configureUrl();

        var database = $rootScope.config.database;
        var collection = $rootScope.config.collection;
        var mapkey = $rootScope.config.mapkey;

        url = url + '/map/' + database + '/' + collection;
        url = url + '/{z}/{x}/{y}/cluster.json';
        url = url + '?mapkey=' + mapkey;

        // Prevent angular cache
        url = url + '&_=' + Math.random();

        return url;
      },
      styleUrl: function() {
        var url = this.configureUrl();

        var database = $rootScope.config.database;
        var collection = $rootScope.config.collection;

        url = url + '/styles/' + database + '/' + collection;

        // Prevent angular cache
        url = url + '&_=' + Math.random();

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
      }
    }
  }
);