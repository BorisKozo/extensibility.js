'use strict';

import EJS from 'vendor/extensibility';
import Marionette from 'marionette';
import Backbone from 'backbone';

import chartsGridViewTemplate from 'templates/dashboard/templates/charts_grid_view';
import chartViewTemplate from 'templates/dashboard/templates/chart_view';

var ChartItemView = Marionette.ItemView.extend({
  template: chartViewTemplate,
  className: 'envelope-left-nav-button',
  tagName: 'li'
});

var ChartsGridView = Marionette.CompositeView.extend({
  template: chartsGridViewTemplate,
  className: 'dashboard-charts-grid',
  childView: ChartItemView,
  childViewContainer: '.js-dashboard-charts-grid-container',
  initialize: function () {
    var charts = EJS.build(EJS.registry.joinPath('dashboard', 'charts'));
    this.collection = new Backbone.Collection(charts);
  }
});

export default ChartsGridView;
