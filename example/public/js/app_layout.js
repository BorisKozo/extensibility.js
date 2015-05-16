'use strict';

import Marionette from 'marionette';
export default class AppLayout extends Marionette.LayoutView {
  constructor(...rest) {
    super(...rest);
    this.template = '<div>Hello World</div>';
  }
}
