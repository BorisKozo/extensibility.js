'use strict';

import Marionette from 'marionette';
import NavView from 'js/envelope/views/nav_view';

import mainTemplate from 'templates/envelope/templates/layout';

var AppLayout = Marionette.LayoutView.extend({
  template: mainTemplate,
  regions: {
    'nav': '.js-envelope-left-nav'
  },

  onRender: function () {
    this.showChildView('nav', new NavView());
  }
});

export default AppLayout;
