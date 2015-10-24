(function (subdivision) {
    'use strict';
    var count = 0;

    // Addin Fields:
    // id
    // order - can be a number, >id, >>id, <id, <<id

    subdivision.Addin = function (options) {
        return subdivision.Addin.$internalConstructor('addin', count++, options);
    };

    subdivision.Addin.$internalConstructor = function (name, counter, options) {
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
    subdivision.addAddin = function (path, addin) {
        if (path === undefined || path === null) {
            throw new Error('path was not defined for addin ' + JSON.stringify(addin));
        }
        var node = subdivision.registry.$getNode(path, true);
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
    subdivision.getAddins = function (path, searchCriteria, skipSort) {
        var node = subdivision.registry.$getNode(path, false);
        if (node === null) {
            return [];
        }
        var result = skipSort ? node.addins : subdivision.utils.topologicalSort(node.addins);
        if (searchCriteria === undefined) {
            return _.clone(result);
        }
        return _.filter(result, searchCriteria);
    };


})(subdivision);