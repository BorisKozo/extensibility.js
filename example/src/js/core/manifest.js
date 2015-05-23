'use strict';

import EJS from 'vendor/extensibility';
import routingService from 'js/core/routing_service';

var manifest = {
  paths: [{
    path: EJS.systemPaths.services,
    addins: [
      {
        id: 'RoutingService',
        type: 'EJS.service',
        order: 1,
        content: routingService
      }
    ]
  }]
};
EJS.readManifest(manifest);
