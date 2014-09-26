function QueryCtrl($scope, $rootScope, $timeout, leafletData) {
  leafletData.getMap().then(
    function(map) {
      var queryControl = $scope.relationalFilterControler();
      map.addControl(new queryControl());
    }
  );

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
        this._container = L.DomUtil.get('search-div');
        this._addMouseOverHandler(this._container);

        // Create textarea to search
        this._textarea = this._createInput();
        
        // // Create a button to update map
        this._searchButton = this._createButton();

        return this._container;
      },
      search: function() {
        try {
          $scope.query = JSON.parse(this._textarea.value);
        } catch(e) {
          console.error('Error', e);
          $scope.query = null;
        }

        $rootScope.$emit('event:queryChanged', JSON.stringify($scope.query));
      },
      _addMouseOverHandler: function(element) {
        L.DomEvent
          .disableClickPropagation(element)
          .on(element, 'mouseover', this._showElements, this)
          .on(element, 'mouseout', this._hideElements, this);
      },
      _showElements: function() {
        this._searchDiv.style.display = 'block';
        this._textarea.style.display = 'block';
        
        this._buttonDiv.style.display = 'block';
        this._searchButton.style.display = 'block';

        var searchIcon = L.DomUtil.get('search-icon');
        searchIcon.className = searchIcon.className + ' pull-right';
      },
      _hideElements: function() {
        this._searchDiv.style.display = 'none';
        this._textarea.style.display = 'none';

        this._buttonDiv.style.display = 'none';
        this._searchButton.style.display = 'none';

        var searchIcon = L.DomUtil.get('search-icon');
        searchIcon.className = 'leaflet-control-search-toggle';
      },
      _createButton: function() {
        this._buttonDiv = L.DomUtil.create('div', 'col-md-2 col-md-offset-4', this._container);
        var button = L.DomUtil.create('button', 'btn-primary small', this._buttonDiv);

        button.id = 'searchButton';
        button.type = 'button';
        button.style['margin-bottom'] = '8px';
        button.style.display = 'none';

        button.innerText = 'Search';

        L.DomEvent
          .on(button, 'click', L.DomEvent.stop, this)
          .on(button, 'click', this.search, this);

        return button;
      },
      _createDiv: function(className) {
        var div = L.DomUtil.create('div', className, this._container);
        div.style.padding = '5px';

        return div;
      },
      _createInput: function () {
        this._searchDiv = this._createDiv('row-fluid');
        this._searchDiv.style.display = 'none';

        var input = L.DomUtil.create('textarea', '', this._searchDiv);
        input.rows = 10;
        input.cols = 40;
        input.autocomplete = 'off';
        input.autocorrect = 'off';
        input.autocapitalize = 'off';
        input.value = JSON.stringify(this.options.searchExample, null, 2);
        input.style.display = 'none';

        L.DomEvent.disableClickPropagation(input);

        return input;
      }
    });
  };
}