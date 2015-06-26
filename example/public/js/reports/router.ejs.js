'use strict';

import EJS from 'vendor/extensibility';
import Backbone from 'backbone';
import ReportLayout from 'js/reports/views/report_layout';
import _ from 'lodash';

var router = {
  paths: [
    {
      path: EJS.registry.joinPath('routes', 'reports'),
      addins: [
        {
          id: 'reports',
          order: 200,
          handleRoute: function (options, axes, remainingAxes) {
            var routingService = EJS.getService('RoutingService');
            var reportsService = EJS.getService('ReportsService');
            if (remainingAxes.length === 0) {
              if (reportsService.reports && reportsService.reports.length > 0) {
                routingService.redirect(reportsService.reports[0].id, true);
              } else {
                routingService.redirect('/');
              }
            }
          }

        }
      ]
    },
    {
      path: EJS.registry.joinPath('routes', 'reports', 'reportName'),
      addins: [
        {
          id: 'reportName',
          order: 100,
          handleRoute: function (options, axes) {
            var reportsService = EJS.getService('ReportsService');
            var reportAddin = reportsService.getReport(_.last(axes));
            var model = new Backbone.Model(reportAddin.report);

            var reportLayout = new ReportLayout({model: model});
            if (options.contentRegion) {
              options.contentRegion.show(reportLayout);
            } else {
              throw new Error('Expecting content region on the router options');
            }
          }

        }
      ]
    }
  ]
};

EJS.readManifest(router);
