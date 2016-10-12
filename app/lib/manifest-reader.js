(function (subdivision) {
    'use strict';
    subdivision.readManifest = function (manifest) {
        _.forEach(manifest.paths, function (pathOptions) {
            var clonedOptions = _.clone(pathOptions);
            delete clonedOptions['addins'];
            delete clonedOptions['id'];
            _.forEach(pathOptions.addins, function (addinOptions) {
                subdivision.addAddin(pathOptions.path, new subdivision.Addin(_.assign({}, clonedOptions, addinOptions)));
            });
        });
    };
})(subdivision);