(function (EJS) {
    'use strict';
    var clusterId = 0;

    function Cluster(addin) {
        this.id = clusterId++;
        this.mergedIds = {};
        this.addins = [];
        this.addins.push(addin);
        this.order = 0;
        this.dependsOnClusters = {};
        this.activeAddin = addin;
    }

    Cluster.prototype.containsAddin = function (id) {
        return _.findIndex(this.addins, {id: id}) !== -1;
    };

    //Cluster.prototype.calculateOrder = function () {
    //    var addin = _.find(this.addins, function (addin) {
    //        return _.isNumber(addin.order);
    //    });
    //    if (addin) {
    //        this.order = addin.order;
    //    }
    //};

    //Makes sure that firstId appears before secondId within this cluster
    Cluster.prototype.verifyOrder = function (firstId, secondId, adjecent) {
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

        if (adjecent) {
            return (secondIndex - firstIndex) === 1;
        }
        return firstIndex < secondIndex;
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
    };

    //Merges the given cluster to the front of this cluster
    Cluster.prototype.mergeToFront = function (cluster) {
        var i;
        for (i = cluster.addins.length - 1; i >= 0; i--) {
            this.addins.unshift(cluster.addins[i]);
        }

        this.mergedIds[cluster.id] = true;
        this.mergedIds = _.assign(this.mergedIds, cluster.mergedIds);
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
        var clusters = [];
        var nextClusters = [];
        var currentCluster;
        var i, addin;
        var targetId = null;
        var cluster = null;

        for (i = 0; i < addins.length; i++) {
            clusters.push(new Cluster(addins[i]));
        }


        while (clusters.length > 0) {
            currentCluster = clusters.pop();
            addin = currentCluster.activeAddin;
            if (_.isString(addin.order)) { //cases of <, <<, >, >>
                if (_.indexOf(addin.order, '>') === 0) { //cases of > and >>
                    if (_.indexOf(addin.order, '>', 1) === 1) { // case of >>
                        targetId = addin.order.substring(2);
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
                        nextClusters.push(currentCluster);
                    } else { //case of >
                        targetId = addin.order.substring(1);
                        cluster = findClusterByAddinId(targetId, clusters, nextClusters, [currentCluster]);
                        if (cluster === null) {
                            throw new Error('Could not find cluster with id ' + targetId + ' for > dependency');
                        }
                        if (cluster.id === currentCluster.id) { //The dependency is already within my cluster
                            if (!cluster.verifyOrder(targetId, addin.id, true)) {
                                throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                            }
                            nextClusters.push(currentCluster);
                        } else {
                            if (cluster.last().id === targetId) {
                                if (cluster.dependsOnClusters[currentCluster.id]) {
                                    throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                                }
                                cluster.mergeToEnd(currentCluster);
                            } else {
                                throw new Error('Could not fulfill > dependency for ' + targetId + ' because ' + cluster.last().id + ' already has the same dependency');
                            }
                        }
                    }
                } else if (_.indexOf(addin.order, '<') === 0) { //cases of < and <<
                    if (_.indexOf(addin.order, '<', 1) === 1) { // case of <<
                        targetId = addin.order.substring(2);
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
                        nextClusters.push(currentCluster);
                    } else {// case of <
                        targetId = addin.order.substring(1);
                        cluster = findClusterByAddinId(targetId, clusters, nextClusters, [currentCluster]);
                        if (cluster === null) {
                            throw new Error('Could not find cluster with id ' + targetId + ' for < dependency');
                        }
                        if (cluster.id === currentCluster.id) { //The dependency is already within my cluster
                            if (!cluster.verifyOrder(addin.id, targetId, true)) {
                                throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                            }
                            nextClusters.push(currentCluster);
                        } else {
                            if (cluster.first().id === targetId) {
                                if (currentCluster.dependsOnClusters[cluster.id]) {
                                    throw new Error('Could not find appropriate order for ' + targetId + ' and ' + addin.id);
                                }
                                cluster.mergeToFront(currentCluster);
                            } else {
                                throw new Error('Could not fulfill < dependency for ' + targetId + ' because ' + cluster.first().id + ' already has the same dependency');
                            }
                        }
                    }
                } else {
                    throw new Error('order must begin with <, <<, >, >> or be a number');
                }
            } else if (_.isNumber(addin.order)) { //If the order is a number
                nextClusters.push(currentCluster);
            } else {
                throw new Error('order must begin with <, <<, >, >> or be a number');
            }
        }

        return nextClusters;
    }

    if (!EJS.utils) {
        EJS.utils = {};
    }

    EJS.utils.topologicalSort = function (addins) {
    };

    EJS.utils.topologicalSort._formSortClusters = formSortClusters;


})(window.EJS || (window.EJS = {}));