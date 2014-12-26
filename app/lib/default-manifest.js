(function (EJS) {
    'use strict';

    EJS.defaultManifest = {
        builders: [
            {
                id: 'EJS.default-builder',
                type: null,
                order: 0,
                build: function (addin) {
                    return addin.content;
                }
            }
        ]
    };


})(EJS);

