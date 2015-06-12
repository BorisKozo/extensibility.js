'use strict';

import EJS from 'vendor/extensibility';
import _ from 'lodash';

var reportsService = {
  initialize: function () {
    this.reports = EJS.build('reports');
  },
  getReport: function (reportId) {
    return _.find(this.reports, {id: reportId});
  }
};

export default reportsService;
