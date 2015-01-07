(function (EJS) {
    'use strict';
    var count = 0;


    EJS.Builder = function (options) {
        options = _.isFunction(options) ? options() : options || {};
        if (!_.isFunction(options.build)) {
            throw new Error('Builder options must contain the "build" function ' + JSON.stringify(options));
        }
        options.id = options.id || ('builder' + count++);
        options.order = options.order || 0;
        var builder = new EJS.Addin(options);
        builder.type = options.hasOwnProperty('type') ? options.type : '';
        builder.build = options.build;
        builder.$next = EJS.Builder.nextBuilder;
        return builder;
    };

    EJS.Builder.nextBuilder = function () {
        var builders = EJS.getBuilders(this.type);
        var index = _.indexOf(builders, this);
        return builders[index + 1];
    };

    EJS.systemBuildersPath = EJS.registry.joinPath(EJS.systemPathPrefix, 'builders');

    /**
     * Adds a new builder with the given builder options to the systemPathPrefix/systemBuildersPath path
     * @param builderOptions
     */
    EJS.addBuilder = function (builderOptions) {
        var builder = new EJS.Builder(builderOptions);
        EJS.addAddin(EJS.systemBuildersPath, builder);
    };

    /**
     * Gets a builders for the appropriate type, if no builder of the given type is found returns the default builder (builder with type === null)
     * @param type
     */
    EJS.getBuilders = function (type) {
        var addins = EJS.getAddins(EJS.systemBuildersPath, {type: type});
        if (addins.length > 0) {
            return addins;
        }
        addins = EJS.getAddins(EJS.systemBuildersPath, {type: null});
        if (addins.length > 0) {
            return addins;
        }
        throw new Error('No builder of type "' + type + '" was defined and no default builder was registered');
    };

    /**
     * Gets a builder for the appropriate type, if no builder of the given type is found returns the default builder (builder with type === null)
     * @param type
     */
    EJS.getBuilder = function (type) {
        return EJS.getBuilders(type)[0];
    };

    /**
     * Returns all the addins in the path after applying the appropriate builder on each
     * @param path - The path to build
     * @param searchCriteria - The search criteria for the underscore filter function
     * @param skipSort - If truthy the topological sort is skipped
     * @returns {Array} = The built addins
     */
    EJS.build = function (path, searchCriteria, skipSort) {
        var addins = EJS.getAddins(path, searchCriteria, skipSort);
        if (addins.length === 0) {
            return addins;
        }
        return _.map(addins, function (addin) {
            //TODO: Optimization that tries to guess the builder from previous builder
            var builder = EJS.getBuilder(addin.type);
            return builder.build(addin);
        });
    };

    /**
     * Builds a tree out of the given path. Each addin will have child elements at path+addin.id added
     * to its items property (default $items).
     * @param path
     */
    EJS.buildTree = function (path) {
        var addins = EJS.getAddins(path);
        if (addins.length === 0) {
            return addins;
        }
        return _.map(addins, function (addin) {
            //TODO: Optimization that tries to guess the builder from previous builder
            var builder = EJS.getBuilder(addin.type);
            var result = builder.build(addin);
            var itemsProperty = addin.itemsProperty || '$items';
            result[itemsProperty] = EJS.buildTree(EJS.registry.joinPath(path, addin.id));
            return result;
        });
    }

})(EJS);