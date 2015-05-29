'use strict';

import EJS from 'vendor/extensibility';
import lineBarChart from 'js/dashboard/charts/line_bar_chart.ejs'; //this needs to be automatic

import ChartsGridView from 'js/dashboard/views/charts_grid_view';


var manifest = {
  paths: [{
    path: 'navbar',
    addins: [
      {
        id: 'Envelope',
        type: 'NavButton',
        order: 10,
        content: {
          title: 'Dashboard',
          link: 'dashboard'
        }
      }
    ]
  }, {
    path: EJS.registry.joinPath('dashboard', 'charts'),
    addins: [{
      id: 'line bar chart',
      order: 100,
      content: lineBarChart
    }

    ]
  },
    {
      path: EJS.registry.joinPath('routes', 'dashboard'),
      addins: [
        {
          id: 'dashboard',
          order: 100,
          handleRoute: function (options) {
            var chartsGridView = new ChartsGridView();
            if (options.contentRegion) {
              options.contentRegion.show(chartsGridView);
            } else {
              throw new Error('Expecting content region on the router options');
            }
          }

        }
      ]
    }]
};

EJS.readManifest(manifest);
