'use strict';

import Marionette from 'marionette';

import formViewTemplate from 'templates/reports/templates/form_view';

var FormView = Marionette.ItemView.extend({
  template: formViewTemplate
});

export default FormView;
