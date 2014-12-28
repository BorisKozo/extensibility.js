(function (EJS) {
    'use strict';
    var count = 0;

    EJS.Builder = function (options) {
        options = _.isFunction(options) ? options() : options || {};
        if (!_.isFunction(options.build)){
            throw new Error('Builder options must contain the "build" function '+JSON.stringify(options));
        }
        options.id = options.id || ('builder' + count++);
        options.order = options.order || 0;
        var builder = new EJS.Addin(options);
        builder.type = options.hasOwnProperty('type') ? options.type : '';
        builder.build = options.build;
        return builder;
    };

    EJS.registry = _.assign(EJS.registry || {}, {
        systemBuildersPath: 'builders',

        /**
         * Adds a new builder with the given builder options to the systemPathPrefix/systemBuildersPath path
         * @param builderOptions
         */
        addBuilder: function (builderOptions) {
            var builder = new EJS.Builder(builderOptions);
            var path = this.joinPath(this.systemPathPrefix, this.systemBuildersPath);
            this.addAddin(path, builder);
        },

        /**
         * Gets a builder for the appropriate type, if no builder of the given type is found returns the default builder (builder with type === null)
         * @param type
         */
        getBuilder: function (type) {
            var path = this.joinPath(this.systemPathPrefix, this.systemBuildersPath);
            var addins = this.getAddins(path, {type: type});
            if (addins.length > 0) {
                return addins[0];
            }
            addins = this.getAddins(path, {type: null});
            if (addins.length > 0) {
                return addins[0];
            }
            throw new Error('No builder of type "' + type + '" was defined and no default builder was registered');
        },
        /**
         * Returns all the addins in the path after applying the appropriate builder on each
         * @param path - The path to build
         * @param searchCriteria - The search criteria for the underscore filter function
         * @param skipSort - If truthy the topological sort is skipped
         * @returns {Array} = The built addins
         */
        build: function (path, searchCriteria, skipSort) {
            var addins = EJS.registry.getAddins(path, searchCriteria, skipSort);
            if (addins.length === 0) {
                return addins;
            }
            return _.map(addins, function (addin) {
                //TODO: Optimization that tries to guess the builder from previous builder
                var builder = EJS.registry.getBuilder(addin.type);
                return builder.build(addin);
            });
        }
    });

})(EJS);