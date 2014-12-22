(function (EJS) {
    'use strict';
    var count = 0;

    EJS.Builder = function (options) {
        options = _.isFunction(options) ? options() : options || {};
        options.id = options.id || ('builder' + count++);
        options.order = options.order || 0;
        return new EJS.Addin(options);
    };

    EJS.registry = _.assign(EJS.registry || {}, {
        systemBuildersPath: 'builders',

        /**
         * Adds a new builder with the given builder options to the systemPathPrefix/systemBuildersPath path
         * @param builderOptions
         */
        addBuilder: function (builderOptions) {
            var builder = new EJS.Builder(builderOptions);
            var path = this.buildPath(this.systemPathPrefix, this.systemBuildersPath);
            this.addAddin(path, builder);
        },


        /**
         * Gets a builder for the appropriate type, if no builder of the given type is found returns the default builder (builder with type === null)
         * @param type
         */
        getBuilder: function (type) {
            var path = this.buildPath(this.systemPathPrefix, this.systemBuildersPath);
            var addins = this.getAddins(path, {type: type});
            if (addins.length > 0) {
                return addins[0];
            }
            addins = this.getAddins(path, {type: null});
            if (addins.length > 0) {
                return addins[0];
            }
            throw new Error('No builder of type ' + type + ' was defined and no default builder was registered');
        }
    });

})(window.EJS || (window.EJS = {}));