(function (EJS) {
    'use strict';
    var count = 0;

    EJS.Command = function (options) {
        options = _.isFunction(options) ? options() : options || {};
        var result = _.assign({}, options);
        result.id = result.id ? String(result.id) : ('command' + count++);
        result.order = result.order || 0;
        return result;
    };
})(EJS);