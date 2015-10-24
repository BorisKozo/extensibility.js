'use strict';

import Marionette from 'marionette';

import reportViewTemplate from 'templates/reports/templates/report_layout';
import FormView from 'js/reports/views/form_view';


var ReportLayout = Marionette.LayoutView.extend({
  template: reportViewTemplate,
  regions: {
    'form': '.js-report-form-container',
    'graph': '.js-report-graph-container',
    'table': '.js-report-table-container'
  },
  serializeData: function () {
    return {
      reportName: this.model.get('name')
    };
  },
  onRender: function () {
    this.showChildView('form', new FormView());
  }
});

export default ReportLayout;
