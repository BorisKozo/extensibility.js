System.config({
  "baseURL": "/",
  "transpiler": "babel",
  "babelOptions": {
    "optional": [
      "runtime"
    ]
  },
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "babel": "npm:babel-core@5.4.3",
    "babel-runtime": "npm:babel-runtime@5.4.3",
    "backbone": "npm:backbone@1.2.0",
    "backbone.babysitter": "github:marionettejs/backbone.babysitter@0.1.6",
    "backbone.wreqr": "github:marionettejs/backbone.wreqr@1.3.2",
    "bootstrap": "github:twbs/bootstrap@3.3.4",
    "core-js": "npm:core-js@0.9.10",
    "handlebars": "github:components/handlebars.js@3.0.3",
    "jquery": "github:components/jquery@2.1.4",
    "marionette": "github:marionettejs/backbone.marionette@2.4.1",
    "underscore": "npm:underscore@1.8.3",
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:twbs/bootstrap@3.3.4": {
      "jquery": "github:components/jquery@2.1.4"
    },
    "npm:backbone@1.2.0": {
      "process": "github:jspm/nodelibs-process@0.1.1",
      "underscore": "npm:underscore@1.8.3"
    },
    "npm:core-js@0.9.10": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});

