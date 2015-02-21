(function (EJS) {
    'use strict';
    var count = 0;

    EJS.Command = function (options) {
        return EJS.Addin.$internalConstructor('command', count++, options);
    };
})(EJS);