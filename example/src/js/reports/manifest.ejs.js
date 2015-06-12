'use strict';

import EJS from 'vendor/extensibility';
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
      path: EJS.systemPaths.services,
      addins: [
        {
          id: 'ReportsService',
          name: 'ReportsService',
          type: 'EJS.service',
          order: 2,
          content: reportsService
        }
      ]
    }
  ]
};

EJS.readManifest(manifest);
