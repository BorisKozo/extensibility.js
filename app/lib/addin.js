(function (EJS) {
    'use strict';
    var count = 0;

    // Addin Fields:
    // id
    // order - can be a number, >id, >>id, <id, <<id

    EJS.Addin = function (options) {
        return EJS.Addin.$internalConstructor('addin', count++, options);
    };

    EJS.Addin.$internalConstructor = function (name, counter, options) {
        options = _.isFunction(options) ? options() : options || {};
        var result = _.assign({}, options);
        result.id = result.id ? String(result.id) : (name + counter);
        result.order = result.order || 0;
        return result;
    };

    /**
     * Adds the given addin to the node at the given path
     * If no addin is specifies creates an empty node at the path
     */
    EJS.addAddin = function (path, addin) {
        if (path === undefined || path === null) {
            throw new Error('path was not defined for addin ' + JSON.stringify(addin));
        }
        var node = EJS.registry.$getNode(path, true);
        if (addin) {
            node.addAddin(addin);
        }
    };

    /**
     * Returns an array of all the addins immediately under the given path using the search criteria
     * Search criteria goes as the parameter for lodash filter function, if undefined then all the addins are returned
     * if skipSort is true the addins will not be sorted by the topological sort, any falsy value will sort them
     * Returns null if the path doesn't exist
     */
    EJS.getAddins = function (path, searchCriteria, skipSort) {
        var node = EJS.registry.$getNode(path, false);
        if (node === null) {
            return [];
        }
        var result = skipSort ? node.addins : EJS.utils.topologicalSort(node.addins);
        if (searchCriteria === undefined) {
            return _.clone(result);
        }
        return _.filter(result, searchCriteria);
    };


})(EJS);