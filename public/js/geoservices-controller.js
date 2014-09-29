function GeoServicesCtrl($scope, $rootScope, services) {

  $scope.showGeoAgg = false;
  $scope.showGeoSearch = false;
  $scope.geoAggList = [];
  $scope.geoSearchList = [];

  $rootScope.$on('event:executeGeoService',
    function(event, geom) {
      if (!geom) {
        $scope.showGeoAgg = false;
        $scope.showGeoSearch = false;
        $scope.geoAggList = [];
        $scope.geoSearchList = [];
        $scope.totalCount = 0;

        $rootScope.$emit('event:clearGeoServices');
      } else if ($scope.geom !== geom) {
        $scope.geom = geom;

        services.executeGeoAgg(geom,
          function(result) {
            $scope.prepareGeoAggList(result);
          }
        );

        services.executeGeoSearch(geom,
          function(result) {
            $scope.geoSearchList = result;
          }
        );
      }
    }
  );

  $scope.prepareGeoAggList = function(result) {
    var newList = [];

    $scope.totalCount = result.doc_total;
    var othersCount = 0;
    var sum = 0;

    result.buckets.forEach(
      function(bucket) {
        bucket.percent = (bucket.doc_count * 100) / $scope.totalCount;
        bucket.percent = Math.round(bucket.percent, 2);

        if (bucket.percent == 0) {
          othersCount += bucket.doc_count;
        } else {
          sum += bucket.doc_count;
          newList.push(bucket);
        }
      }
    );

    if (othersCount > 0) {
      othersCount = ($scope.totalCount - sum) + othersCount;

      var percent = (othersCount * 100) / $scope.totalCount;
      percent = Math.round(percent, 2);

      var othersBucket = {
        doc_count: othersCount,
        key: 'Other',
        percent: percent
      }

      newList.push(othersBucket);
    }

    $scope.geoAggList = newList;
  };

  $rootScope.$on('event:toggleGeoAgg',
    function(event, toggle) {
      $scope.showGeoAgg = toggle;
      if (toggle) {
        $scope.subtitle = 'GeoAggregation';
      }
    }
  );

  $rootScope.$on('event:toggleGeoSearch',
    function(event, toggle) {
      $scope.showGeoSearch = toggle;
      if (toggle) {
        $scope.subtitle = 'GeoSearch';
      }
    }
  );
}