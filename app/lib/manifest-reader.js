(function (EJS) {
    'use strict';
    EJS.readManifest = function (manifest) {
        _.forEach(manifest.paths, function (pathOptions) {
            _.forEach(pathOptions.addins, function (addinOptions) {
                EJS.addAddin(pathOptions.path, new EJS.Addin(addinOptions));
            });
        });
    };
})(EJS);