'use strict';

/* Services */
var app = angular.module('gogeo-devguide.services', []).
  value('version', '0.1.0')
  ;

app.factory('services',
  function($rootScope, $http) {
    return {
      config: function(callback) {
        $http.get('/config').success(callback);
      },
      configureUrl: function(prefix) {
        var url = $rootScope.config.url;

        if (!_.string.startsWith(url, 'https')) {
          url = 'https://' + prefix + url;
        }

        return url;
      },
      pngUrl: function() {
        var prefix = null;

        if ($rootScope.config.subdomains) {
          prefix = '{s}.';
        } else {
          prefix = 'maps.';
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

        return url;
      },
      clusterUrl: function() {
        var url = this.configureUrl('maps.');

        var database = $rootScope.config.database;
        var collection = $rootScope.config.collection;
        var mapkey = $rootScope.config.mapkey;

        url = url + '/map/' + database + '/' + collection;
        url = url + '/{z}/{x}/{y}/cluster.json';
        url = url + '?mapkey=' + mapkey;

        return url;
      }
    }
  }
);