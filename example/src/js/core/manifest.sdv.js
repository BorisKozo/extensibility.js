'use strict';

import subdivision from 'vendor/subdivision';
import routingService from 'js/core/routing_service';

var manifest = {
  paths: [{
    path: subdivision.systemPaths.services,
    addins: [
      {
        id: 'RoutingService',
        name: 'RoutingService',
        type: 'subdivision.service',
        order: 1,
        content: routingService
      }
    ]
  }]
};

subdivision.readManifest(manifest);
