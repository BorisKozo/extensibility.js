'use strict';

import subdivision from 'vendor/subdivision';
import reportsService from 'js/reports/reports_service';


var manifest = {
  paths: [{
    path: 'navbar',
    addins: [
      {
        id: 'Reports',
        order: '>>Envelope',
        type: 'NavButton',
        content: {
          title: 'Reports',
          link: 'reports'
        }
      }
    ]
  },
    {
      path: subdivision.systemPaths.services,
      addins: [
        {
          id: 'ReportsService',
          name: 'ReportsService',
          type: 'subdivision.service',
          order: 2,
          content: reportsService
        }
      ]
    }
  ]
};

subdivision.readManifest(manifest);
