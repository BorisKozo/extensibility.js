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