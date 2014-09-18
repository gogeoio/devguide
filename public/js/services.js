'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
var app = angular.module('gogeo-devguide.services', []).
  value('version', '0.1.0')
  ;

app.factory('services',
  function($rootScope, $http) {
    return {
      config: function(callback) {
        $http.get('/config').success(callback);
      },
      configureUrl: function() {
        var url = $rootScope.config.url;

        if (!_.string.startsWith(url, 'http')) {
          url = 'http://' + url;
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

        return url;
      },
      pngUrl: function(style) {
        var url = this.configureUrl();

        var database = $rootScope.config.database;
        var collection = $rootScope.config.collection;
        var mapkey = $rootScope.config.mapkey;

        url = url + '/map/' + database + '/' + collection;
        url = url + '/{z}/{x}/{y}/tile.png';
        url = url + '?mapkey=' + mapkey;
        // That is to not cut the marker.
        url = url + '&buffer=16';

        if (style && style !== 'default') {
          url = url + '&stylename=' + style;
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
      getStyles: function(callback) {
        var url = this.styleUrl();

        url = url + '?mapkey=' + $rootScope.config.mapkey;
        url = url + '&byName=true';

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