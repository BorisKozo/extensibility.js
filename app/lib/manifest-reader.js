(function (EJS) {
  'use strict';
  EJS.manifest = function (manifest) {
    _.forEach(manifest.paths, function (path) {
      _.forEach(path.addins, function (addinOptions) {
        EJS.registry.addAddin(path, new EJS.addin(addinOptions));
      });
    });
  };
})(window.EJS || (window.EJS = {}));