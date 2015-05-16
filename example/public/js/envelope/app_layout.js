'use strict';

import Marionette from 'marionette';
import mainLayout from 'templates/envelope/templates/layout';
export default
class AppLayout extends Marionette.LayoutView {
  constructor(...rest) {
    super(...rest);
    this.template = mainLayout;
  }

  serializeData() {
    return {
      'world': 'XXCCXX'
    };
  }
}
