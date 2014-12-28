(function (EJS) {
    'use strict';
    var count = 0;

    // Addin Fields:
    // id
    // order - can be a number, >id, >>id, <id, <<id

    EJS.Addin = function (options) {
        options = _.isFunction(options) ? options() : options || {};
        this.id = options.id ? String(options.id) : ('addin' + count++);
        this.order = options.order || 0;
    };

    EJS.registry = _.assign(EJS.registry || {}, {
        /**
         * Adds the given addin to the node at the given path
         * If no addin is specifies creates an empty node at the path
         */
        addAddin: function (path, addin) {
            var node = this._getNode(path, true);
            if (addin) {
                node.addAddin(addin);
            }
        },

        /**
         * Returns an array of all the addins immediately under the given path using the search criteria
         * Search criteria goes as the parameter for lodash filter function, if undefined then all the addins are returned
         * if skipSort is true the addins will not be sorted by the topological sort, any falsy value will sort them
         * Returns null if the path doesn't exist
         */
        getAddins: function (path, searchCriteria, skipSort) {
            var node = this._getNode(path, false);
            if (node === null) {
                return [];
            }
            var result = skipSort ? node.addins : EJS.utils.topologicalSort(node.addins);
            if (searchCriteria === undefined) {
                return _.clone(result);
            }
            return _.filter(result, searchCriteria);
        }
    });


})(EJS);