// subdivision v0.2.0
// Copyright (c)2016 Boris Kozorovitzky.
// Distributed under MIT license
// https://github.com/BorisKozo/subdivision.git

'use strict'
var _ = require('lodash');
var subdivision = {};

(function (subdivision) {
    'use strict';
// ** Note - This file is taken as-is from Backbone 1.1.2 to reduce dependency on Backbone.
// ** I added a convenience function offContext which calls off with the first two arguments as null

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
    var array = [];
    //var push = array.push;
    var slice = array.slice;
    //var splice = array.splice;

    var Events = {

        // Bind an event to a `callback` function. Passing `"all"` will bind
        // the callback to all events fired.
        on: function (name, callback, context) {
            if (!eventsApi(this, 'on', name, [callback, context]) || !callback) {
                return this;
            }
            this._events = this._events ? this._events : {};
            var events = this._events[name] || (this._events[name] = []);
            events.push({callback: callback, context: context, ctx: context || this});
            return this;
        },

        // Bind an event to only be triggered a single time. After the first time
        // the callback is invoked, it will be removed.
        once: function (name, callback, context) {
            if (!eventsApi(this, 'once', name, [callback, context]) || !callback) {
                return this;
            }
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
            if (!this._events || !eventsApi(this, 'off', name, [callback, context])) {
                return this;
            }
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
                    if (!retain.length) {
                        delete this._events[name];
                    }
                }
            }

            return this;
        },
        // Shorthand for removing all the events from a certain context
        offContext: function (context) {
            this.off(null, null, context);
        },

        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        trigger: function (name) {
            if (!this._events) {
                return this;
            }
            var args = slice.call(arguments, 1);
            if (!eventsApi(this, 'trigger', name, args)) {
                return this;
            }

            var events = this._events[name];
            var allEvents = this._events.all;
            if (events) {
                triggerEvents(events, args);
            }
            if (allEvents) {
                triggerEvents(allEvents, arguments);
            }
            return this;
        },

        // Tell this object to stop listening to either specific events ... or
        // to every object it's currently listening to.
        stopListening: function (obj, name, callback) {
            var listeningTo = this._listeningTo;
            if (!listeningTo) {
                return this;
            }
            var remove = !name && !callback;
            if (!callback && typeof name === 'object') {
                callback = this;
            }
            if (obj) {
                (listeningTo = {})[obj._listenId] = obj;
            }
            for (var id in listeningTo) {
                obj = listeningTo[id];
                obj.off(name, callback, this);
                if (remove || _.isEmpty(obj._events)) {
                    delete this._listeningTo[id];
                }
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
        if (!name) {
            return true;
        }


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
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.ctx);
                }
                return;
            case 1:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.ctx, a1);
                }
                return;
            case 2:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.ctx, a1, a2);
                }
                return;
            case 3:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
                }
                return;
            default:
                while (++i < l) {
                    (ev = events[i]).callback.apply(ev.ctx, args);
                }
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
            if (!callback && typeof name === 'object') {
                callback = this;
            }
            obj[implementation](name, callback, this);
            return this;
        };
    });

    subdivision.Events = Events;
    subdivision.createEventBus = function (base) {
        base = base || {};
        return _.assign(base, subdivision.Events);
    };
})(subdivision);
(function (subdivision) {
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
        return adjacent ? (delta === 1) : (delta > 0);
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
        /*jshint maxcomplexity:100 */
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
                            if (!_.includes(nextClusters, currentCluster)) {
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
                                if (!_.includes(nextClusters, currentCluster)) {
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
                            if (!_.includes(nextClusters, currentCluster)) {
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
                                if (!_.includes(nextClusters, currentCluster)) {
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

    if (!subdivision.utils) {
        subdivision.utils = {};
    }

    subdivision.utils.topologicalSort = function (addins) {
        var clusters = subdivision.utils.topologicalSort._formSortClusters(addins);
        return subdivision.utils.topologicalSort._sortClusters(clusters);
    };

    subdivision.utils.topologicalSort._formSortClusters = formSortClusters;

    subdivision.utils.topologicalSort._sortClusters = sortClusters;


})(subdivision);
(function (subdivision) {
    'use strict';

    //constants:
    var openParethesisChar = '(';
    var closeParethesisChar = ')';
    var notChar = '!';
    var orChar = '|';
    var andChar = '&';

    function ExpressionNode(stringExpression, depth) {
        this.data = null;
        this.depth = depth;

        if (_.isEmpty(stringExpression)) {
            throw new Error('can not evaluate an empty expression');
        }

        stringExpression = stringExpression.trim();

        var removedAllParentheses = false;
        var result;
        while (!removedAllParentheses) {
            result = this.analyzeExpression(stringExpression);
            if (result.parenthesesExpression) {
                //peal off the parentheses
                stringExpression = stringExpression.substring(1, stringExpression.length - 1);
            } else {
                removedAllParentheses = true;
            }
        }

        if (result.unaryOperator) {
            var childSubTree = new ExpressionNode(result.expression, this.depth + 1);
            this.data = this.createUnaryNotNodeData(childSubTree);
        } else if (result.literal) {
            this.data = this.createLiteralNodeData(result.literal);
        } else if (result.binaryOperator) {
            this.data = this.createBinaryOperandNodeData(
                new ExpressionNode(result.leftOperand, this.depth + 1),
                new ExpressionNode(result.rightOperand, this.depth + 1),
                result.binaryOperator);
        } else {
            throw new Error('could not analyze expression: ' + stringExpression);
        }
    }

    ExpressionNode.prototype.analyzeExpression = function (expression) {
        var openParentheses = 0;
        var closeParentheses = 0;
        var binaryOperator = null;
        var leftOperatorEndIndex = 0;
        var currentChar;

        for (var i = 0, length = expression.length; i < length; i++) {
            currentChar = expression[i];

            if (currentChar === openParethesisChar) {
                openParentheses++;
            } else if (currentChar === closeParethesisChar) {
                closeParentheses++;
            }

            if (this.isWhiteSpaceChar(currentChar)) {
                continue;
            }

            if (openParentheses > closeParentheses) {
                continue;
            } else if ((openParentheses === closeParentheses) && this.isBinaryOperand(currentChar)) {
                //there are two cases:
                //(1) if we don't have a binaryOperator yet save the currentChar as the one
                //(2) if we do have one already and it's AND and the current one is OR prefer it (this creates the AND>OR operator precedence)
                //    the AND will be left to be created as one of the children in the tree and thus evaluated first.
                if ((!binaryOperator) ||
                    (binaryOperator && binaryOperator === andChar && currentChar === orChar)) {
                    binaryOperator = currentChar;
                    leftOperatorEndIndex = i;
                }

            } else if (closeParentheses > openParentheses) {
                //TODO: add some more information here
                throw new Error('mismatch of parentheses');
            }
        }

        if (binaryOperator !== null) {
            var leftOperand = expression.substring(0, leftOperatorEndIndex).trim();
            var rightOperand =  expression.substring(leftOperatorEndIndex + 1, expression.length + 1).trim();
            if(!(leftOperand && rightOperand)){
                throw new Error('one or more operands are missing in expression: ' +  expression);
            }
            // exp & exp
            return {
                leftOperand: leftOperand,
                binaryOperator: binaryOperator,
                rightOperand: rightOperand
            };
        } else { //binaryOperator === null
            if (expression[0] === openParethesisChar) {
                if (openParentheses === closeParentheses) {
                    if(expression[expression.length - 1] === closeParethesisChar) {
                        // (exp)
                        return {
                            parenthesesExpression: true
                        };
                    } else {
                        // (exp)bla
                        throw new Error('operator is missing between two operands');
                    }
                } else if (openParentheses > closeParentheses) {
                    //((exp) unclosed parentheses case (the other case we should be getting on the previous code
                    //TODO add some more info here
                    throw new Error('unclosed parentheses');
                } else {
                    // (exp)) this case is actually handled when running through the chars (just in case)
                    throw new Error('mismatch of parentheses');
                }
            } else if (expression[0] === notChar) {
                //!exp
                return {
                    unaryOperator: notChar,
                    expression: expression.substring(1, expression.length + 1)
                };
            } else if (openParentheses === 0) {
                //literal
                return {
                    literal: expression
                };
            } else {
                //there must be an error here
                throw new Error('should not have happened. expresion does not fall into any one of the patterns');
            }
        }
    };

    ExpressionNode.prototype.isBinaryOperand = function (char) {
        return char === orChar || char === andChar;
    };

    ExpressionNode.prototype.isWhiteSpaceChar = function (char) {
        return char !== char.trim();
    };

    ExpressionNode.prototype.createUnaryNotNodeData = function (childNode) {
        return {
            operator: notChar,
            child: childNode,
            evaluate: function (context) {
                return context.not(childNode.evaluate(context));
            }
        };
    };

    ExpressionNode.prototype.createLiteralNodeData = function (literal) {
        return {
            literal: literal,
            evaluate: function (context) {
                var resolvedLiteral = context.literal(literal);
                if(resolvedLiteral === null || resolvedLiteral === undefined){
                    throw new Error('could not resolve literal: ' + literal);
                }
                return resolvedLiteral;
            }
        };
    };

    ExpressionNode.prototype.createBinaryOperandNodeData = function (leftChildSubtree, rightChildSubtree, operator) {
        return {
            operator: operator,
            leftChildNode: leftChildSubtree,
            rightChildNode: rightChildSubtree,
            evaluate: function (context) {
                if (this.operator === orChar) {
                    return context.or(leftChildSubtree.evaluate(context), rightChildSubtree.evaluate(context));
                } else if (this.operator === andChar) {
                    return context.and(leftChildSubtree.evaluate(context), rightChildSubtree.evaluate(context));
                }
            }
        };
    };

    ExpressionNode.prototype.evaluate = function (context) {
        return this.data.evaluate(context);
    };

    function BooleanPhraseParser() {
        this.expresionTreeRoot = null;
    }

    BooleanPhraseParser.prototype.parse = function (stringExpression) {
        this.expresionTreeRoot = new ExpressionNode(stringExpression, 0);
        var expresionRoot = this.expresionTreeRoot;
        return function (context) {
            return expresionRoot.evaluate(context);
        };
    };

    BooleanPhraseParser.prototype.evaluate = function (stringExpression, context) {
        if (!context) {
            throw new Error('context was not supplied');
        }
        return this.parse(stringExpression)(context);
    };

    if (!subdivision.utils) {
        subdivision.utils = {};
    }

    subdivision.utils.BooleanPhraseParser = BooleanPhraseParser;
})(subdivision);
(function (subdivision) {
    'use strict';
    subdivision.systemPaths = {
        prefix: 'subdivision'
    };

    subdivision.vent = subdivision.createEventBus();

    //This will move to service file
    function buildServicesInternal() {
        if (_.isFunction(subdivision.buildServices)) {
            subdivision.vent.trigger('before:buildServices');
            return subdivision.buildServices().then(function () {
                subdivision.vent.trigger('after:buildServices');
            });
        } else {
            return Promise.resolve();
        }
    }

    //This will move to commands file
    function buildCommandsInternal() {
        var commands = subdivision.build(subdivision.systemPaths.commands);
        _.forEach(commands, function (command) {
            subdivision.addCommand(command, true);
        });
    }

    subdivision.start = function () {

        if (subdivision.defaultManifest) {
            subdivision.vent.trigger('before:readDefaultManifest');
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.vent.trigger('after:readDefaultManifest');
        }

        subdivision.$generateBuilders();

        //This will be a generic initializer
        return buildServicesInternal().then(function () {
            buildCommandsInternal();
        });
    };
})(subdivision);
(function (subdivision) {
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

    subdivision.registry = {
        $defaultOrder: 100,
        
        $getNode: function (axes, createIfNotExists) {
            if (_.isString(axes)) {
                axes = subdivision.registry.breakPath(axes);
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
        verifyAxis: function (axis) {
            if (_.isString(axis)) {
                if (_.isEmpty(axis) || _.indexOf(axis, _delimiter) >= 0) {
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
                return subdivision.registry.joinPath.apply(this, _.flatten(arguments[0]));
            }
            var args = Array.prototype.slice.call(arguments, 0);
            var result = [];
            _.forEach(args, function (value) {
                var axes = subdivision.registry.breakPath(value);
                var i;
                for (i = 0; i < axes.length; i++) {
                    result.push(axes[i]);
                }
            });
            if (result.length === 0) {
                return '';
            } else {
                return result.join(_delimiter);
            }
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
                if (!subdivision.registry.verifyAxis(axis)) {
                    throw new Error('Invalid axis ' + axis);
                }
            });
            return splitPath;
        },
        /**
         * returns true if the given path exists in the registry and false otherwise
         */
        pathExists: function (path) {
            var node = this.$getNode(path, false);
            return node !== null;
        },

        /**
         * Returns all the paths that exist under the given path
         */
        getSubPaths: function(path) {
            var node = this.$getNode(path, false);
            if (node !== null){
                return _.keys(node.nodes);
            } else {
                return null;
            }
        },

        /**
         * Clears the registry of all the nodes (you shouldn't use this function)
         */
        $clear: function () {
            _registry = new Node('');
        }
    };

    subdivision.registry.$clear();
})(subdivision);
(function (subdivision) {
    'use strict';

    subdivision.defaultManifest = {
        paths: []
    };


})(subdivision);


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
(function (subdivision) {
    'use strict';
    var count = 0;
    var builders;
    var defaultBuilder;


    function buildInternal(type, addin, options) {
        var builder = subdivision.getBuilder(type);
        if (builder.preBuildTarget) {
            addin = buildInternal(builder.preBuildTarget, addin, options);
        }
        return builder.build(addin, options);
    }

    function buildInternalAsync(type, addin, options) {
        try {
            var builder = subdivision.getBuilder(type);
            var promise = Promise.resolve(addin);

            if (builder.preBuildTarget) {
                promise = buildInternalAsync(builder.preBuildTarget, addin, options);
            }

            return promise.then(function (addin) {
                return builder.build(addin, options);
            });
        }
        catch (ex) {
            return Promise.reject(ex);
        }
    }


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
                order: subdivision.registry.$defaultOrder,
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
     * @param options - Custom options to be passed to the addin builder
     * @param searchCriteria - The search criteria for the underscore filter function
     * @param skipSort - If truthy the topological sort is skipped
     * @returns {Array} = The built addins
     */
    subdivision.build = function (path, options, searchCriteria, skipSort) {
        var addins = subdivision.getAddins(path, searchCriteria, skipSort);
        if (addins.length === 0) {
            return addins;
        }
        return _.map(addins, function (addin) {
            return buildInternal(addin.type, addin, options);
        });
    };

    /**
     * Returns all the addins in the path after applying the appropriate builder on each
     * @param path - The path to build
     * @param options - Custom options to be passed to the addin builder
     * @param searchCriteria - The search criteria for the underscore filter function
     * @param skipSort - If truthy the topological sort is skipped
     * @returns {Array} = A promise that resolves with an array of the built addins
     */
    subdivision.build.async = function (path, options, searchCriteria, skipSort) {
        var addins = subdivision.getAddins(path, searchCriteria, skipSort);
        if (addins.length === 0) {
            return Promise.resolve(addins);
        }
        var promises = _.map(addins, function (addin) {
            //TODO: Optimization that tries to guess the builder from previous builder
            return buildInternalAsync(addin.type, addin, options);
        });

        return Promise.all(promises);
    };

    /**
     * Builds a single addin based on its type
     * @param addin The addin to build
     * @param options The options to pass to the builder
     */
    subdivision.buildAddin = function (addin, options) {
        return buildInternal(addin.type, addin, options);
    };

    /**
     * The async version of buildAddin
     * @param addin The addin to build
     * @param options The options to pass to the builder
     * @returns A promise that when resolved returns the built addin
     */

    subdivision.buildAddin.async = function (addin, options) {
        return buildInternalAsync(addin.type, addin, options);
    };

    /**
     * Builds a tree out of the given path. Each addin will have child elements at path+addin.id added
     * to its items property (default $items).
     * @param path
     * @param options - Custom options to be passed to the addin builder
     */
    subdivision.buildTree = function (path, options) {
        var addins = subdivision.getAddins(path);
        if (addins.length === 0) {
            return addins;
        }
        return _.map(addins, function (addin) {
            //TODO: Optimization that tries to guess the builder from previous builder
            var result = buildInternal(addin.type, addin, options);
            var itemsProperty = addin.itemsProperty || '$items';
            result[itemsProperty] = subdivision.buildTree(subdivision.registry.joinPath(path, addin.id), options);
            return result;
        });
    };

    subdivision.$generateBuilders = function () {
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

    subdivision.$clearBuilders = function () {
        builders = {};
        defaultBuilder = null;
    };

    subdivision.$clearBuilders();
})(subdivision);
(function (subdivision) {
    'use strict';
    var services;

    function initializeServiceRecursive(service) {
        if (service) {
            return initializeServiceRecursive(service.$next).then(function () {
                if (service.hasOwnProperty('initialize') && _.isFunction(service.initialize)) {
                    return service.initialize();
                } else {
                    return Promise.resolve();
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    subdivision.Service = function (options, prototype) {
        var result = Object.create(prototype || {});
        if (_.isFunction(options)) {
            options = options();
        }
        options = options || {};
        result = _.assign(result, {
            $vent: subdivision.createEventBus(),
            $next: prototype ? prototype : undefined
        }, options);
        return result;
    };

    subdivision.systemPaths.services = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'services');

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [{
            target: 'subdivision.service',
            id: 'subdivision.serviceBuilder',
            order: subdivision.registry.$defaultOrder,
            build: function (addin) {
                if (_.isString(addin.name) && !_.isEmpty(addin.name)) {
                    subdivision.addService(addin.name, addin.content, addin.override);
                } else {
                    throw new Error('Service name must be defined ' + JSON.stringify(addin));
                }
            }
        }]
    });


    /**
     * Returns the service instance by the given name or null if no service by that name can be found or instantiated
     * @param name - The name of the service to retrieve
     */
    subdivision.getService = function (name) {
        return services[name];
    };

    subdivision.addService = function (name, options, override) {
        name = String(name).trim();
        var nextService;
        if (!override) {
            nextService = subdivision.getService(name);
        }
        var service = new subdivision.Service(options, nextService);
        services[name] = service;
        return service;
    };

    subdivision.$clearServices = function () {
        services = {};
    };

    /**
     * Builds and initializes all the registered services
     * Returns a promise which is resolved when all the services are initialized or rejected if one of the services has failed to initialize
     */
    subdivision.buildServices = function () {
        subdivision.$clearServices();
        subdivision.build(subdivision.systemPaths.services); //TODO: This assumes that there is a builder side effect that adds the services to the services map
        var promises = [];
        _.forEach(_.keys(services), function (name) {
            subdivision.vent.trigger('before:service:initialized', name);
            promises.push(initializeServiceRecursive(subdivision.getService(name)).then(function () {
                subdivision.vent.trigger('after:service:initialized', name, subdivision.getService(name));
            }));
        });
        return Promise.all(promises);
    };

})(subdivision);
(function (subdivision) {
    'use strict';
    var count = 0;
    var commands = {};



    subdivision.Command = function (options) {
        options = options || {};
        var result = subdivision.Addin.$internalConstructor('command', count++, options);
        result.name = options.name || result.id;
        if (!_.isFunction(result.execute)) {
            throw new Error('Command options must contain the "execute" function ' + JSON.stringify(options));
        }
        if (!result.hasOwnProperty('isValid')) {
            result.isValid = true;
        }
        if (!result.hasOwnProperty('canExecute')) {
            result.canExecute = subdivision.Command.$canExecute;
        }

        return result;
    };

    subdivision.Command.$canExecute = function () {
        var conditionResult = true;
        var condition;
        if (this.hasOwnProperty('condition')) {
            condition = this.condition;
            if (_.isString(condition)) {
                condition = subdivision.getCondition(condition);
                if (condition === undefined) { //generate condition from isValid parser
                    condition = new subdivision.Condition({
                        isValid: this.condition
                    });
                }
            }
            conditionResult = condition.isValid(this);
        }


        var validity = true;
        if (this.hasOwnProperty('isValid')) {
            if (_.isFunction(this.isValid)) {
                validity = this.isValid();
            } else {
                validity = Boolean(this.isValid);
            }
        }

        return conditionResult && validity;
    };

    subdivision.systemPaths.commands = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'commands');

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [{
            target: 'subdivision.command',
            id: 'subdivision.commandBuilder',
            order: subdivision.registry.$defaultOrder,
            build: function (addin) {
                return new subdivision.Command(addin);
            }
        }]
    });

    subdivision.getCommand = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        return commands[name];
    };

    subdivision.addCommand = function (options, force) {
        var command = new subdivision.Command(options);

        var name = command.name;

        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (commands[name] && !force) {
            return false;
        }

        subdivision.removeCommand(name);

        commands[name] = command;
        if (_.isFunction(command.initialize)) {
            command.initialize();
        }
        return true;
    };

    subdivision.removeCommand = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (commands[name] && _.isFunction(commands[name].destroy)) {
            commands[name].destroy();
        }
        commands[name] = undefined;
    };

    subdivision.$clearCommands = function () {
        commands = {};
    };
})
(subdivision);
(function (subdivision) {
    'use strict';
    var count = 0;
    var conditions = {};

    subdivision.Condition = function (options) {
        options = options || {};
        var result = subdivision.Addin.$internalConstructor('condition', count++, options);
        result.name = options.name || result.id;
        if (_.isString(result.isValid)) { //In this case we need to build the actual isValid function from the boolean parser
            var expression = result.isValid;
            result.isValid = function () {
                var booleanParser = new subdivision.utils.BooleanPhraseParser();
                var context = subdivision.Condition.$buildContext();  //we need to build the context each time in case someone changed the literals
                var parsedCondition = booleanParser.evaluate(expression, context);
                return parsedCondition.isValid();
            };
        }
        if (!_.isFunction(result.isValid)) {
            throw new Error('A condition must have an isValid function ' + result.id);
        }
        return result;
    };

    subdivision.Condition.$buildContext = function () {
        var notConditionOperator = subdivision.build(subdivision.systemPaths.conditionOperations,null, {literal: '!'})[0];
        var andConditionOperator = subdivision.build(subdivision.systemPaths.conditionOperations,null, {literal: '&'})[0];
        var orConditionOperator = subdivision.build(subdivision.systemPaths.conditionOperations,null, {literal: '|'})[0];
        if (notConditionOperator && andConditionOperator && orConditionOperator) {
            return {
                not: notConditionOperator.generator,
                and: andConditionOperator.generator,
                or: orConditionOperator.generator,
                literal: function (conditionName) {
                    return subdivision.getCondition(conditionName);
                }
            };
        } else {
            throw new Error('Condition operators for "not", "and", "or" must exist');
        }
    };

    subdivision.systemPaths.conditions = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'conditions');

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [{
            target: 'subdivision.condition',
            id: 'subdivision.conditionBuilder',
            order: subdivision.registry.$defaultOrder,
            build: function (addin) {
                var condition = new subdivision.Condition(addin);
                return condition;
            }
        }]
    });

    subdivision.getCondition = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        return conditions[name];
    };

    subdivision.addCondition = function (options, force) {
        var condition = new subdivision.Condition(options);

        var name = condition.name;

        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (conditions[name] && !force) {
            return false;
        }

        subdivision.removeCondition(name);

        conditions[name] = condition;
        if (_.isFunction(condition.initialize)) {
            condition.initialize();
        }
        return true;
    };

    subdivision.removeCondition = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (conditions[name] && _.isFunction(conditions[name].destroy)) {
            conditions[name].destroy();
        }
        conditions[name] = undefined;
    };

    subdivision.$clearConditions = function () {
        conditions = {};
    };

    subdivision.systemPaths.conditionOperations = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'conditionOperations');

    subdivision.Condition.$conditionOperationBuilder = {
        target: 'subdivision.conditionOperation',
        id: 'subdivision.conditionOperationBuilder',
        order: subdivision.registry.$defaultOrder,
        build: function (addin) {
            return {
                literal: addin.literal,
                generator: addin.generator
            };
        }
    };

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [subdivision.Condition.$conditionOperationBuilder]
    });

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.conditionOperations,
        addins: [
            {
                id: 'NotConditionOperation',
                literal: '!',
                type: 'subdivision.conditionOperation',
                generator: function (element) {
                    return {
                        isValid: function () {
                            if (_.isFunction(element.isValid)) {
                                return !Boolean(element.isValid());
                            } else {
                                throw new Error('Cannot evaluate "!" operation because the target has no isValid function ' + JSON.stringify(element));
                            }
                        }
                    };
                }
            },
            {
                id: 'OrConditionOperation',
                literal: '|',
                type: 'subdivision.conditionOperation',
                generator: function (leftElement, rightElement) {
                    return {
                        isValid: function () {
                            if (!_.isFunction(leftElement.isValid)) {
                                throw new Error('Cannot evaluate "|" operation because the first target has no isValid function ' + JSON.stringify(leftElement));
                            }
                            if (!_.isFunction(rightElement.isValid)) {
                                throw new Error('Cannot evaluate "|" operation because the second target has no isValid function ' + JSON.stringify(rightElement));
                            }

                            return Boolean(leftElement.isValid()) || Boolean(rightElement.isValid());
                        }
                    };
                }
            },
            {
                id: 'AndConditionOperation',
                literal: '&',
                type: 'subdivision.conditionOperation',
                generator: function (leftElement, rightElement) {
                    return {
                        isValid: function () {
                            if (!_.isFunction(leftElement.isValid)) {
                                throw new Error('Cannot evaluate "&" operation because the first target has no isValid function ' + JSON.stringify(leftElement));
                            }
                            if (!_.isFunction(rightElement.isValid)) {
                                throw new Error('Cannot evaluate "&" operation because the second target has no isValid function ' + JSON.stringify(rightElement));
                            }

                            return Boolean(leftElement.isValid()) && Boolean(rightElement.isValid());
                        }
                    };
                }
            }
        ]
    });
})(subdivision);

(function (subdivision) {
    'use strict';
    subdivision.readManifest = function (manifest) {
        _.forEach(manifest.paths, function (pathOptions) {
            _.forEach(pathOptions.addins, function (addinOptions) {
                subdivision.addAddin(pathOptions.path, new subdivision.Addin(addinOptions));
            });
        });
    };
})(subdivision);
(function (subdivision) {
    'use strict';
    var glob = require('glob');
    var _ = require('lodash');

    function readMatches(matches) {
        _.forEach(matches, function (filename) {
            var manifest =  require(filename);
            subdivision.readManifest(manifest);
        });
    }

    subdivision.readManifestFiles = function (globPattern, globOptions) {
        return new Promise(function (resolve, reject) {
            glob(globPattern, globOptions, function (err, matches) {
                if (err) {
                    reject(err);
                    return;
                }
                readMatches(matches);
                resolve();
            });
        });
    };
    subdivision.readManifestFilesSync = function (globPattern, globOptions) {
        var matches = glob.sync(globPattern, globOptions);
        readMatches(matches);
    };

})(subdivision);


module.exports = subdivision;
//# sourceMappingURL=subdivision.node.js.map