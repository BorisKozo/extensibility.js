(function (subdivision) {
    'use strict';
    var count = 0;
    var builders;
    var defaultBuilder;


    subdivision.Builder = function (options) {
        var builder = subdivision.Addin.$internalConstructor('builder', count++, options);
        if (!_.isFunction(builder.build)) {
            throw new Error('Builder options must contain the "build" function ' + JSON.stringify(options));
        }
        builder.target = builder.target === undefined ? '' : builder.target;
        return builder;
    };

    subdivision.systemPaths.builders = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'builders');

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [
            {
                ///Update docs if this changes
                id: 'subdivision.defaultBuilder',
                type: 'subdivision.builder',
                target: null,
                order: 100,
                build: function (addin) {
                    return _.cloneDeep(addin);
                }
            }
        ]
    });

    /**
     * Adds a new builder created from the options to the list of known builders.
     * If a builder that builds the given type already exists then
     * the new builder is added based on the forced option. If force is truthy it is added anyway otherwise does nothing
     * Returns true if a builder was added and false otherwise
     *
     */
    subdivision.addBuilder = function (options, force) {
        var builder = new subdivision.Builder(options);
        if (builder.target === null) {
            if (!defaultBuilder || force) {
                defaultBuilder = builder;
                return true;
            } else {
                return false;
            }
        }

        if (!builders.hasOwnProperty(builder.target) || force) {
            builders[builder.target] = builder;
            return true;
        } else {
            return false;
        }

    };

    /**
     * Gets a builder for the appropriate type, if no builder of the given type is found returns the default builder (builder with type === null)
     * @param type
     */
    subdivision.getBuilder = function (type) {
        if (type === null && defaultBuilder) {
            return defaultBuilder;
        } else {
            if (builders.hasOwnProperty(type)) {
                return builders[type];
            }
            if (defaultBuilder) {
                return defaultBuilder;
            }
        }

        throw new Error('No builder of type "' + type + '" was defined and no default builder was registered');
    };

    /**
     * Returns all the addins in the path after applying the appropriate builder on each
     * @param path - The path to build
     * @param searchCriteria - The search criteria for the underscore filter function
     * @param skipSort - If truthy the topological sort is skipped
     * @returns {Array} = The built addins
     */
    subdivision.build = function (path, searchCriteria, skipSort) {
        var addins = subdivision.getAddins(path, searchCriteria, skipSort);
        if (addins.length === 0) {
            return addins;
        }
        return _.map(addins, function (addin) {
            //TODO: Optimization that tries to guess the builder from previous builder
            var builder = subdivision.getBuilder(addin.type);
            return builder.build(addin);
        });
    };

    /**
     * Returns all the addins in the path after applying the appropriate builder on each
     * @param path - The path to build
     * @param searchCriteria - The search criteria for the underscore filter function
     * @param skipSort - If truthy the topological sort is skipped
     * @returns {Array} = A promise that resolves with an array of the built addins
     */
    subdivision.build.async = function (path, searchCriteria, skipSort) {
        var addins = subdivision.getAddins(path, searchCriteria, skipSort);
        if (addins.length === 0) {
            return Promise.resolve(addins);
        }
        var promises = _.map(addins, function (addin) {
            //TODO: Optimization that tries to guess the builder from previous builder
            var builder = subdivision.getBuilder(addin.type);
            try {
                return Promise.resolve(builder.build(addin));
            }
            catch (ex) {
                return Promise.reject(ex);
            }
        });

        return Promise.all(promises);
    };

    /**
     * Builds a tree out of the given path. Each addin will have child elements at path+addin.id added
     * to its items property (default $items).
     * @param path
     */
    subdivision.buildTree = function (path) {
        var addins = subdivision.getAddins(path);
        if (addins.length === 0) {
            return addins;
        }
        return _.map(addins, function (addin) {
            //TODO: Optimization that tries to guess the builder from previous builder
            var builder = subdivision.getBuilder(addin.type);
            var result = builder.build(addin);
            var itemsProperty = addin.itemsProperty || '$items';
            result[itemsProperty] = subdivision.buildTree(subdivision.registry.joinPath(path, addin.id));
            return result;
        });
    };

    subdivision.generateBuilders = function () {
        subdivision.$clearBuilders();
        var addins = subdivision.getAddins(subdivision.systemPaths.builders, {target: null});
        if (addins.length > 0) {
            defaultBuilder = new subdivision.Builder(addins[0]);
        }
        addins = subdivision.getAddins(subdivision.systemPaths.builders);
        _.forEach(addins, function (addin) {
            subdivision.addBuilder(addin);
        });
    };

    subdivision.$clearBuilders = function(){
        builders = {};
        defaultBuilder = null;
    };

    subdivision.$clearBuilders();
})(subdivision);