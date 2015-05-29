'use strict';

import EJS from 'vendor/extensibility';
//import routingService from 'js/dashboard/routing_service';

var manifest = {
  paths: [{
    path: 'navbar',
    addins: [
      {
        id: 'Envelope',
        type: 'NavButton',
        order: 10,
        content:{
          title: 'Dashboard',
          link: 'dashboard'
        }
      }
    ]
  }]
};

EJS.readManifest(manifest);
