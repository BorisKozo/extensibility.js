(function (subdivision) {
    'use strict';
    var glob = require('glob');
    var _ = require('lodash');

    function readMatches(matches) {
        _.forEach(matches, function (filename) {
            var manifest =  require(filename);
            subdivision.readManifest(manifest);
        });
    }

    subdivision.readManifestFiles = function (globPattern, globOptions) {
        return new Promise(function (resolve, reject) {
            glob(globPattern, globOptions, function (err, matches) {
                if (err) {
                    reject(err);
                    return;
                }
                readMatches(matches);
                resolve();
            });
        });
    };
    subdivision.readManifestFilesSync = function (globPattern, globOptions) {
        var matches = glob.sync(globPattern, globOptions);
        readMatches(matches);
    };

})(subdivision);
