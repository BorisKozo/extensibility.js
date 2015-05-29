'use strict';

import EJS from 'vendor/extensibility';
import Marionette from 'marionette';
import Backbone from 'backbone';

import chartsGridViewTemplate from 'templates/dashboard/templates/charts_grid_view';
import chartViewTemplate from 'templates/dashboard/templates/chart_view';

var ChartItemView = Marionette.ItemView.extend({
  template: chartViewTemplate,
  className: 'envelope-left-nav-button',
  tagName: 'li',
  ui:{
    'container':'.js-dashboard-chart-container'
  },
  serializeData: function () {
    return {
      title: this.model.get('title')
    };
  },
  onRender:function(){
    var config = this.model.get('config');
    if (config) {
      this.ui.container.highcharts(config);
      this.chart = this.ui.container.highcharts();
      this.model.get('setData')(this.chart);
    }
  }
});

var ChartsGridView = Marionette.CompositeView.extend({
  template: chartsGridViewTemplate,
  className: 'dashboard-charts-grid',
  childView: ChartItemView,
  childViewContainer: '.js-dashboard-charts-grid-container',
  ui: {
    'container': '.js-dashboard-charts-grid-container'
  },
  initialize: function () {
    var charts = EJS.build(EJS.registry.joinPath('dashboard', 'charts'));
    this.collection = new Backbone.Collection(charts);
  },
  onRender: function () {
    this.ui.container.sortable();
  }

});

export default ChartsGridView;
