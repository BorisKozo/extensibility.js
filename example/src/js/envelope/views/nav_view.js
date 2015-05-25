'use strict';

import EJS from 'vendor/extensibility';
import Marionette from 'marionette';
import Backbone from 'backbone';

import navTemplate from 'templates/envelope/templates/nav_panel';
import navButtonTemplate from 'templates/envelope/templates/nav_button';

var NavItemView = Marionette.ItemView.extend({
  template: navButtonTemplate,
  serializeData: function () {
    return {
      title: this.model.get('title')
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
  },
  onRender: function () {

  }
});

export default NavView;
