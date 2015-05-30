'use strict';

import EJS from 'vendor/extensibility';
import Marionette from 'marionette';
import Backbone from 'backbone';

import navTemplate from 'templates/envelope/templates/nav_panel';
import navButtonTemplate from 'templates/envelope/templates/nav_button';



var NavItemView = Marionette.ItemView.extend({
  template: navButtonTemplate,
  className: 'envelope-left-nav-button',
  tagName: 'li',
  initialize: function () {
    var routingService = EJS.getService('RoutingService');
    this.listenTo(routingService.$vent, 'after:route', this.afterRoute);
  },
  serializeData: function () {
    return {
      title: this.model.get('title'),
      link: this.model.get('link')
    };
  },
  onRender: function () {
    this.$el.attr('role', 'presentation');
  },
  afterRoute: function (context, route) {
    if (route.length > 0 && route[0] === this.model.get('link')) {
      this.$el.addClass('active');
    } else {
      this.$el.removeClass('active');
    }
  }
});

var NavView = Marionette.CompositeView.extend({

  template: navTemplate,
  className: 'envelope-left-nav-container',
  childView: NavItemView,
  childViewContainer: '.js-envelope-side-nav-buttons',
  initialize: function () {
    var buttons = EJS.build('navbar');
    this.collection = new Backbone.Collection(buttons);
  }
});

export default NavView;
