// extensibility v0.0.1
// Copyright (c)2014 Boris Kozorovitzky.
// Distributed under MIT license
// https://github.com/BorisKozo/extensibility.js.git

(function(root, factory) {

    // Set up EJS appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['lodash', 'exports'], function(_, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global EJS.
            root.EJS = factory(root, exports, _);
        });

        // Next for Node.js or CommonJS.
    } else if (typeof exports !== 'undefined') {
        var _ = require('underscore');
        factory(root, exports, _);

        // Finally, as a browser global.
    } else {
        root.EJS = factory(root, {}, root._);
    }

})(this, function(root, EJS, _) {


(function (EJS) {
    'use strict';
// ** Note - This file is taken as-is from Backbone 1.1.2 to reduce dependency on Backbone **

// Backbone.Events
// ---------------

// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback
// functions to an event; `trigger`-ing an event fires all callbacks in
// succession.
//
//     var object = {};
//     _.extend(object, Backbone.Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
    var Events = {

        // Bind an event to a `callback` function. Passing `"all"` will bind
        // the callback to all events fired.
        on: function (name, callback, context) {
            if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
            this._events = this._events?this._events:{};
            var events = this._events[name] || (this._events[name] = []);
            events.push({callback: callback, context: context, ctx: context || this});
            return this;
        },

        // Bind an event to only be triggered a single time. After the first time
        // the callback is invoked, it will be removed.
        once: function (name, callback, context) {
            if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
            var self = this;
            var once = _.once(function () {
                self.off(name, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(name, once, context);
        },

        // Remove one or many callbacks. If `context` is null, removes all
        // callbacks with that function. If `callback` is null, removes all
        // callbacks for the event. If `name` is null, removes all bound
        // callbacks for all events.
        off: function (name, callback, context) {
            var retain, ev, events, names, i, l, j, k;
            if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
            if (!name && !callback && !context) {
                this._events = void 0;
                return this;
            }
            names = name ? [name] : _.keys(this._events);
            for (i = 0, l = names.length; i < l; i++) {
                name = names[i];
                events = this._events[name];
                if (events) {
                    this._events[name] = retain = [];
                    if (callback || context) {
                        for (j = 0, k = events.length; j < k; j++) {
                            ev = events[j];
                            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                                (context && context !== ev.context)) {
                                retain.push(ev);
                            }
                        }
                    }
                    if (!retain.length) delete this._events[name];
                }
            }

            return this;
        },
        // Shorthand for removing all the events from a certain context
        offAll: function (context) {
            this.off(null, null, context);
        },

        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        trigger: function (name) {
            if (!this._events) return this;
            var args = slice.call(arguments, 1);
            if (!eventsApi(this, 'trigger', name, args)) return this;
            var events = this._events[name];
            var allEvents = this._events.all;
            if (events) triggerEvents(events, args);
            if (allEvents) triggerEvents(allEvents, arguments);
            return this;
        },

        // Tell this object to stop listening to either specific events ... or
        // to every object it's currently listening to.
        stopListening: function (obj, name, callback) {
            var listeningTo = this._listeningTo;
            if (!listeningTo) return this;
            var remove = !name && !callback;
            if (!callback && typeof name === 'object') callback = this;
            if (obj) (listeningTo = {})[obj._listenId] = obj;
            for (var id in listeningTo) {
                obj = listeningTo[id];
                obj.off(name, callback, this);
                if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
            }
            return this;
        }

    };

// Regular expression used to split event strings.
    var eventSplitter = /\s+/;

// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
    var eventsApi = function (obj, action, name, rest) {
        if (!name) return true;

        // Handle event maps.
        if (typeof name === 'object') {
            for (var key in name) {
                obj[action].apply(obj, [key, name[key]].concat(rest));
            }
            return false;
        }

        // Handle space separated event names.
        if (eventSplitter.test(name)) {
            var names = name.split(eventSplitter);
            for (var i = 0, l = names.length; i < l; i++) {
                obj[action].apply(obj, [names[i]].concat(rest));
            }
            return false;
        }

        return true;
    };

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy (most internal
// Backbone events have 3 arguments).
    var triggerEvents = function (events, args) {
        var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
        switch (args.length) {
            case 0:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx);
                return;
            case 1:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);
                return;
            case 2:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);
                return;
            case 3:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
                return;
            default:
                while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
                return;
        }
    };

    var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
    _.each(listenMethods, function (implementation, method) {
        Events[method] = function (obj, name, callback) {
            var listeningTo = this._listeningTo || (this._listeningTo = {});
            var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
            listeningTo[id] = obj;
            if (!callback && typeof name === 'object') callback = this;
            obj[implementation](name, callback, this);
            return this;
        };
    });

    EJS.Events = Events;
})(EJS);
(function (EJS) {
    'use strict';
    var clusterId = 0;

    function Cluster(addin) {
        this.id = clusterId++;
        this.mergedIds = {};
        this.addins = [addin];
        this.order = _.isNumber(addin.order) ? addin.order : 0;
        this.dependsOnClusters = {};
        this.activeAddin = addin;
    }

    Cluster.prototype.containsAddin = function (id) {
        return _.findIndex(this.addins, {id: id}) !== -1;
    };

    //Makes sure that firstId appears before secondId within this cluster
    Cluster.prototype.verifyOrder = function (firstId, secondId, adjacent) {
        if (firstId === secondId) {
            return false;
        }

        var firstIndex = _.findIndex(this.addins, {id: firstId});
        if (firstIndex === -1) {
            throw new Error('Could not find addin with id ' + firstId + ' in cluster ' + this.id);
        }
        var secondIndex = _.findIndex(this.addins, {id: secondId});
        if (secondIndex === -1) {
            throw new Error('Could not find addin with id ' + secondId + ' in cluster ' + this.id);
        }

        var delta = secondIndex - firstIndex;
        return adjacent ? (delta == 1) : (delta > 0);
    };

    //Returns the first addin in the cluster
    Cluster.prototype.first = function () {
        return this.addins[0];
    };

    //Returns the last addin in the cluster
    Cluster.prototype.last = function () {
        return this.addins[this.addins.length - 1];
    };

    //Merges the given cluster to the end of this cluster
    Cluster.prototype.mergeToEnd = function (cluster) {
        var i;
        for (i = 0; i < cluster.addins.length; i++) {
            this.addins.push(cluster.addins[i]);
        }

        this.mergedIds[cluster.id] = true;
        this.mergedIds = _.assign(this.mergedIds, cluster.mergedIds);

        this.dependsOnClusters = _.assign(this.dependsOnClusters, cluster.dependsOnClusters);
    };

    //Merges the given cluster to the front of this cluster
    Cluster.prototype.mergeToFront = function (cluster) {
        var i;
        for (i = cluster.addins.length - 1; i >= 0; i--) {
            this.addins.unshift(cluster.addins[i]);
        }

        this.mergedIds[cluster.id] = true;
        this.mergedIds = _.assign(this.mergedIds, cluster.mergedIds);

        this.dependsOnClusters = _.assign(this.dependsOnClusters, cluster.dependsOnClusters);
    };


    /*
     * Returns a cluster that contains an addin with the given id or null if no cluster contains this id
     */
    function findClusterByAddinId(id) {
        var i, j;
        var clusters;
        for (j = 1; j < arguments.length; j++) {
            clusters = arguments[j];
            for (i = 0; i < clusters.length; i++) {
                if (clusters[i].containsAddin(id)) {
                    return clusters[i];
                }
            }
        }

        return null;
    }

    function formSortClusters(addins) {
        var clusters;
        var nextClusters = [];
        var currentCluster;
        var orderAxis, addin;
        var targetId = null;
        var cluster = null;
        var splitOrder;

        clusters = _.map(addins, function (addin) {
            return new Cluster(addin);
        });

        while (clusters.length > 0) {
            currentCluster = clusters.pop();
            addin = currentCluster.activeAddin;
            if (_.isString(addin.order)) { //cases of <, <<, >, >>
                splitOrder = addin.order.split(',');
                for (orderAxis = 0; orderAxis < splitOrder.length; orderAxis++) {
                    if (_.indexOf(splitOrder[orderAxis], '>') === 0) { //cases of > and >>
                        if (_.indexOf(splitOrder[orderAxis], '>', 1) === 1) { // case of >>
                            targetId = splitOrder[orderAxis].substring(2);
                            cluster = findClusterByAddinId(targetId, clusters, nextClusters, [currentCluster]);
                            if (cluster === null) {
                                throw new Error('Could not find cluster with id ' + targetId + ' for >> dependency');
                            }
                            if (cluster.id === currentCluster.id) { //The dependency is already within my cluster
                                if (!cluster.verifyOrder(targetId, addin.id)) {
                                    throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                                }
                            }
                            currentCluster.dependsOnClusters[cluster.id] = true;
                            if (!_.contains(nextClusters, currentCluster)) {
                                nextClusters.push(currentCluster);
                            }
                        } else { //case of >
                            if (orderAxis !== (splitOrder.length - 1)) {
                                throw  new Error('> dependency must be last in ' + addin.order + ' at ' + addin.id);
                            }

                            targetId = splitOrder[orderAxis].substring(1);
                            cluster = findClusterByAddinId(targetId, clusters, nextClusters, [currentCluster]);
                            if (cluster === null) {
                                throw new Error('Could not find cluster with id ' + targetId + ' for > dependency');
                            }
                            if (cluster.id === currentCluster.id) { //The dependency is already within my cluster
                                if (!cluster.verifyOrder(targetId, addin.id, true)) {
                                    throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                                }
                                if (!_.contains(nextClusters, currentCluster)) {
                                    nextClusters.push(currentCluster);
                                }
                            } else {
                                if (cluster.last().id === targetId) {
                                    if (cluster.dependsOnClusters[currentCluster.id]) {
                                        throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                                    }
                                    cluster.mergeToEnd(currentCluster);
                                    _.remove(nextClusters, currentCluster);
                                    break;
                                } else {
                                    throw new Error('Could not fulfill > dependency for ' + targetId + ' because ' + cluster.last().id + ' already has the same dependency');
                                }
                            }
                        }
                    } else if (_.indexOf(splitOrder[orderAxis], '<') === 0) { //cases of < and <<
                        if (_.indexOf(splitOrder[orderAxis], '<', 1) === 1) { // case of <<
                            targetId = splitOrder[orderAxis].substring(2);
                            cluster = findClusterByAddinId(targetId, clusters, nextClusters, [currentCluster]);
                            if (cluster === null) {
                                throw new Error('Could not find cluster with id ' + targetId + ' for << dependency');
                            }
                            if (cluster.id === currentCluster.id) { //The dependency is already within my cluster
                                if (!cluster.verifyOrder(addin.id, targetId)) {
                                    throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                                }
                            }
                            cluster.dependsOnClusters[currentCluster.id] = true;
                            if (!_.contains(nextClusters, currentCluster)) {
                                nextClusters.push(currentCluster);
                            }
                        } else {// case of <
                            if (orderAxis !== (splitOrder.length - 1)) {
                                throw  new Error('< dependency must be last in ' + addin.order + ' at ' + addin.id);
                            }
                            targetId = splitOrder[orderAxis].substring(1);
                            cluster = findClusterByAddinId(targetId, clusters, nextClusters, [currentCluster]);
                            if (cluster === null) {
                                throw new Error('Could not find cluster with id ' + targetId + ' for < dependency');
                            }
                            if (cluster.id === currentCluster.id) { //The dependency is already within my cluster
                                if (!cluster.verifyOrder(addin.id, targetId, true)) {
                                    throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                                }
                                if (!_.contains(nextClusters, currentCluster)) {
                                    nextClusters.push(currentCluster);
                                }
                            } else {
                                if (cluster.first().id === targetId) {
                                    if (currentCluster.dependsOnClusters[cluster.id]) {
                                        throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                                    }
                                    cluster.mergeToFront(currentCluster);
                                    _.remove(nextClusters, currentCluster);
                                    break;
                                } else {
                                    throw new Error('Could not fulfill < dependency for ' + targetId + ' because ' + cluster.first().id + ' already has the same dependency');
                                }
                            }
                        }
                    } else {
                        throw new Error('order must begin with <, <<, >, >> or be a number');
                    }
                }
            } else if (_.isNumber(addin.order)) { //If the order is a number
                nextClusters.push(currentCluster);
            } else {
                throw new Error('order must begin with <, <<, >, >> or be a number');
            }
        }

        return nextClusters;
    }

    function sortClusters(clusters) {
        var addins = [];
        var nextClusters = [];
        var currentClusters = _.clone(clusters);
        var zeroClusters = [];
        var i, j, k, ids;
        var prevLength;
        while (currentClusters.length > 0) {
            prevLength = currentClusters.length;
            zeroClusters = [];
            nextClusters = [];
            for (i = 0; i < currentClusters.length; i++) {
                if (_.keys(currentClusters[i].dependsOnClusters).length === 0) {
                    zeroClusters.push(currentClusters[i]);
                } else {
                    nextClusters.push(currentClusters[i]);
                }
            }

            for (i = 0; i < zeroClusters.length; i++) {
                ids = _.keys(zeroClusters[i].mergedIds);
                ids.push(String(zeroClusters[i].id));
                for (k = 0; k < ids.length; k++) {
                    for (j = 0; j < nextClusters.length; j++) {
                        delete nextClusters[j].dependsOnClusters[ids[k]];
                    }
                }
            }

            zeroClusters = _.sortBy(zeroClusters, 'order');
            for (i = 0; i < zeroClusters.length; i++) {
                for (j = 0; j < zeroClusters[i].addins.length; j++) {
                    addins.push(zeroClusters[i].addins[j]);
                }
            }

            currentClusters = nextClusters;
            if (prevLength === currentClusters.length) {
                throw new Error('Circular dependency detected in topological sort');
            }
        }

        return addins;
    }

    if (!EJS.utils) {
        EJS.utils = {};
    }

    EJS.utils.topologicalSort = function (addins) {
        var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
        return EJS.utils.topologicalSort._sortClusters(clusters);
    };

    EJS.utils.topologicalSort._formSortClusters = formSortClusters;

    EJS.utils.topologicalSort._sortClusters = sortClusters;


})(EJS);
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


    EJS.registry = _.assign(EJS.registry || {}, {
        systemPathPrefix: 'EJS',

        _getNode: function (axes, createIfNotExists) {
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
            var node = this._getNode(path, false);
            return node !== null;
        },


        /**
         * Clears the registry of all the nodes (you shouldn't use this function)
         */
        clear: function () {
            _registry = new Node('');
        }
    });

    EJS.registry.clear();
})(EJS);
(function (EJS) {
    'use strict';
    var count = 0;

    // Addin Fields:
    // id
    // order - can be a number, >id, >>id, <id, <<id

    EJS.Addin = function (options) {
        options = _.isFunction(options) ? options() : options || {};
        this.id = options.id || ('addin' + count++);
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
                return null;
            }
            var result = skipSort ? node.addins : EJS.utils.topologicalSort(node.addins);
            if (searchCriteria === undefined) {
                return _.clone(result);
            }
            return _.filter(result, searchCriteria);
        }
    });


})(EJS);
(function (EJS) {
    'use strict';
    var count = 0;

    EJS.Builder = function (options) {
        options = _.isFunction(options) ? options() : options || {};
        options.id = options.id || ('builder' + count++);
        options.order = options.order || 0;
        var builder = new EJS.Addin(options);
        builder.type = options.hasOwnProperty('type') ? options.type : '';
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
            throw new Error('No builder of type ' + type + ' was defined and no default builder was registered');
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
            if (addins === null) {
                return null;
            }
            return _.map(addins, function (addin) {
                var builder = EJS.registry.getBuilder(addin);
                return builder.build(addin);
            });
        }
    });

})(EJS);
(function (EJS) {
    'use strict';

    EJS.defaultManifest = {
        builders: [
            {
                id: 'EJS.default-builder',
                type: null,
                order: 0,
                build: function (addin) {
                    return addin.content;
                }
            }
        ]
    };


})(EJS);


});