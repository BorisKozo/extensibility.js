(function (subdivision) {
    'use strict';
    subdivision.readManifest = function (manifest) {
        _.forEach(manifest.paths, function (pathOptions) {
            var isEnabled = true;
            if (_.isFunction(pathOptions.isEnabled)) {
                isEnabled = pathOptions.isEnabled();
            } else {
                if (_.isBoolean(pathOptions.isEnabled)) {
                    isEnabled = pathOptions.isEnabled;
                }
            }
            if (isEnabled === false) {
                return;
            }

            var clonedOptions = _.clone(pathOptions);
            delete clonedOptions['addins'];
            delete clonedOptions['id'];
            delete clonedOptions['isEnabled'];
            _.forEach(pathOptions.addins, function (addinOptions) {
                subdivision.addAddin(pathOptions.path, new subdivision.Addin(_.assign({}, clonedOptions, addinOptions)));
            });
        });
    };
})(subdivision);