'use strict';

import subdivision from 'vendor/subdivision';

var manifest = {
  paths: [{
    path: 'navbar',
    addins: [
      {
        id: 'Apps',
        order: '>>Campaign',
        type: 'NavButton',
        content: {
          title: 'Apps',
          link: 'apps'
        }
      }
    ]
  }]
};

subdivision.readManifest(manifest);
