System.config({
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
    "babel": "npm:babel-core@5.5.6",
    "babel-runtime": "npm:babel-runtime@5.5.6",
    "backbone": "npm:backbone@1.2.1",
    "backbone.babysitter": "github:marionettejs/backbone.babysitter@0.1.7",
    "backbone.wreqr": "github:marionettejs/backbone.wreqr@1.3.2",
    "bootstrap": "github:twbs/bootstrap@3.3.4",
    "core-js": "npm:core-js@0.9.16",
    "handlebars": "github:components/handlebars.js@3.0.3",
    "jquery": "github:components/jquery@2.1.4",
    "lodash": "npm:lodash@3.9.3",
    "marionette": "github:marionettejs/backbone.marionette@2.4.1",
    "underscore": "npm:underscore@1.8.3",
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:twbs/bootstrap@3.3.4": {
      "jquery": "github:components/jquery@2.1.4"
    },
    "npm:babel-runtime@5.5.6": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:backbone@1.2.1": {
      "process": "github:jspm/nodelibs-process@0.1.1",
      "underscore": "npm:underscore@1.8.3"
    },
    "npm:core-js@0.9.16": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:lodash@3.9.3": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});

