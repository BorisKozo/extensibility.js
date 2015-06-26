'use strict';

import EJS from 'vendor/extensibility';

var report = {
  name: 'Users'
};

var manifest = {
  paths: [
    {
      path: EJS.registry.joinPath('reports'),
      addins: [
        {
          id: 'users',
          order: 200,
          report: report
        }
      ]
    }
  ]
};

EJS.readManifest(manifest);
