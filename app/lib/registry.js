(function (EJS) {
    'use strict';
    var _registry;
    var _delimiter = '/'; //The delimiter that will be used for all the path construction, path axes may not contain this delimiter

    function Node(name) {
        this.name = name;
        this.nodes = {};
        this.addins = [];
    }

    Node.prototype.addAddin = function (addin) {
        this.addins.push(addin);
    };


    EJS.registry = {
        getNode: function (axes, createIfNotExists) {
            if (_.isString(axes)) {
                axes = EJS.registry.breakPath(axes);
            }
            var currentNode = _registry;
            var i;
            for (i = 0; i < axes.length; i++) {
                if (!currentNode.nodes[axes[i]]) {
                    if (createIfNotExists) {
                        currentNode.nodes[axes[i]] = new Node(axes[i]);
                    } else {
                        return null;
                    }
                }
                currentNode = currentNode.nodes[axes[i]];
            }

            return currentNode;
        },

        /***
         * Returns true if the axis is valid for the given delimiter
         */
        verifyAxis: function (axis, delimiter) {
            if (_.isString(axis)) {
                if (_.isEmpty(axis) || _.indexOf(axis, delimiter) >= 0) {
                    return false;
                }

                return true;
            }
            return false;
        },
        /***
         * Creates a path from the given axes, if one of the axes is invalid an exception will be thrown
         */
        joinPath: function () {
            if (arguments.length === 0) {
                return '';
            }
            if (arguments[0] instanceof Array) {
                return EJS.registry.joinPath.apply(this, _.flatten(arguments[0]));
            }
            var args = Array.prototype.slice.call(arguments, 0);
            return args.reduce(function (previous, current) {
                if (EJS.registry.verifyAxis(current, _delimiter)) {
                    if (previous === '') {
                        return current;
                    }
                    return previous + _delimiter + current;
                } else {
                    throw new Error('Illegal path axis ' + current + ' for delimiter ' + _delimiter);
                }
            }, '');
        },
        /***
         * Breaks the given path to its axes, if the path is invalid an exception is thrown
         */
        breakPath: function (path) {
            if (!_.isString(path)) {
                throw new Error('path must be a string ' + JSON.stringify(path));
            }
            if (path === '') {
                return [];
            }
            var splitPath = path.split(_delimiter);
            _.forEach(splitPath, function (axis) {
                if (!EJS.registry.verifyAxis(axis, _delimiter)) {
                    throw new Error('Invalid axis ' + axis);
                }
            });
            return splitPath;
        },
        /**
         * returns true if the given path exists in the registry and false otherwise
         */
        nodeExists: function (path) {
            var node = this.getNode(path, false);
            return node !== null;
        },

        /**
         * Clears the registry of all the nodes (you shouldn't use this function)
         */
        clear: function () {
            _registry = new Node('');
        }
    };

    EJS.registry.clear();
})(EJS);