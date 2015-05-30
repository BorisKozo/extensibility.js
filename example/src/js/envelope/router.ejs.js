'use strict';

import AppLayout from 'js/envelope/views/app_layout';

var rootLayout = null;

var router = {
  handleBaseRoute: function (options) {
    if (rootLayout === null) {
      rootLayout = new AppLayout({el: '#main'});
      rootLayout.render();
    }
    options.contentRegion = rootLayout.getRegion('content');
    return options;
  }
};

export default router;
