'use strict';

import EJS from 'vendor/extensibility';
import Marionette from 'marionette';
import Backbone from 'backbone';

import reportViewTemplate from 'templates/reports/templates/report_layout';

var ReportLayout = Marionette.LayoutView.extend({
  template: reportViewTemplate,
  regions: {
    'form':''
  },
  serializeData: function () {
    return {
      reportName: this.model.get('name')
    };
  },
  onRender: function () {
  }
});

export default ReportLayout;
