(function (EJS) {
    'use strict';

    EJS.defaultManifest = {
        paths: [
            {
                path: EJS.systemBuildersPath,
                addins: [
                    {
                        id: 'EJS.defaultBuilder',
                        type: null,
                        order: 100,
                        build: function (addin) {
                            return addin.content;
                        }
                    }
                ]
            }
        ]
    };


})(EJS);

