//This could be a JSON file but I wanted comments
(function (EJS) {
    'use strict';
    var count = 0;

    EJS.defaultManifest = {
        builders: [
            {
                id: 'EJS.default-builder',
                type: null,
                order: 0,
                build: function (addin) {
                    return addin.data;
                }
            }
        ]
    }


})(window.EJS || (window.EJS = {}));

