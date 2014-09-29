'use strict';

function LegendCtrl($scope, $rootScope) {
  /* ----------------------------------------------------------------------- */
  /*                                                                         */
  /*                                 Legend                                  */
  /*                                                                         */
  /* ----------------------------------------------------------------------- */

  $scope.legends = [];
  $scope.showLegend = false;
  $scope.type = '';
  $scope.divWidth = '200px';

  $rootScope.$on('event:toggleLegend',
    function(event, toggle, type, legend) {
      $scope.showLegend = toggle;

      $scope.type = type;

      if (toggle) {
        $scope.prepareLegend(type, legend);
      }
    }
  );

  // Show legend
  $scope.prepareLegend = function(type, legend) {

    if (legend) {
      $scope.legends[type] = legend;
    } else {
      legend = $scope.legend[type];
    }

    var labels = $('#legend-labels');
    labels.find('li').remove();
    for (var i in legend) {
      var item = legend[i];

      var dc = 2;
      if (parseInt(item.min) > 200) {
        dc = 0;
      }

      var min = $.number(item.min, dc, ',', '.');
      var max = $.number(item.max, dc, ',', '.');
      var text = min + ' .. ' + max;
      var string = "<li><span style='background: #COLOR;'></span>#TEXT</li>";
      string = string.replace('#COLOR', item.color);
      string = string.replace('#TEXT', text);

      labels.append(string);
    }
  }
};