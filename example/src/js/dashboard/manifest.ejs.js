'use strict';

import EJS from 'vendor/extensibility';
import lineBarChart from 'js/dashboard/charts/line_bar_chart.ejs'; //this needs to be automatic
import areaChart from 'js/dashboard/charts/area_chart.ejs'; //this needs to be automatic
import heatmapChart from 'js/dashboard/charts/heatmap_chart.ejs'; //this needs to be automatic
import pieChart from 'js/dashboard/charts/pie_chart.ejs'; //this needs to be automatic

import ChartsGridView from 'js/dashboard/views/charts_grid_view';


var manifest = {
  paths: [
    {
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
    },
    {
      path: EJS.registry.joinPath('dashboard', 'charts'),
      addins: [
        {
          id: 'line bar chart',
          order: 100,
          content: lineBarChart,
          type:'dashboar.chart'
        },
        {
          id: 'area chart',
          order: 200,
          content: areaChart,
          type:'dashboar.chart'
        },
        {
          id: 'heatmap chart',
          order: 300,
          content: heatmapChart,
          type:'dashboar.chart'
        }, {
          id: 'pie chart',
          order: 400,
          content: pieChart,
          type:'dashboar.chart'
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
    },
    {
      path: EJS.registry.joinPath('routes'),
      addins: [
        {
          id: 'redirectToDashboard',
          order: 100,
          handleRoute: function (options, prevAxes, nextAxes) {
            var routingService;
            if (nextAxes.length === 0) {
              routingService = EJS.getService('RoutingService');
              routingService.redirect('#dashboard');
            }
          }

        }
      ]
    },
    {
      path: EJS.systemPaths.builders,
      addins: [
        {
          id: 'DashboardChartBuilder',
          target: 'dashboar.chart',
          build: function (addin) {
            return addin.content;
          }
        }
      ]
    }
  ]
};

EJS.readManifest(manifest);
