(function (subdivision) {
    'use strict';
    subdivision.readManifest = function (manifest) {
        _.forEach(manifest.paths, function (pathOptions) {
            _.forEach(pathOptions.addins, function (addinOptions) {
                subdivision.addAddin(pathOptions.path, new subdivision.Addin(addinOptions));
            });
        });
    };
})(subdivision);