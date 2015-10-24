'use strict';

import subdivision from 'vendor/subdivision';

var report = {
  name: 'Users'
};

var manifest = {
  paths: [
    {
      path: subdivision.registry.joinPath('reports'),
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

subdivision.readManifest(manifest);
