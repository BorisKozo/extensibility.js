'use strict';

import subdivision from 'vendor/subdivision';
import _ from 'lodash';

var reportsService = {
  initialize: function () {
    this.reports = subdivision.build('reports');
  },
  getReport: function (reportId) {
    return _.find(this.reports, {id: reportId});
  }
};

export default reportsService;
