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
      pngUrl: function() {
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

        // Prevent angular cache
        url = url + '&_=' + Math.random();

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
      }
    }
  }
);