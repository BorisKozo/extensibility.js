(function (EJS) {
  'use strict';
  function Cluster(addin) {
    this.addins = [];
    if (addin) {
      this.addins.push(addin);
    }
    this.order = 0;
    this.dependsOnClusters = [];
    //this.futureDependencies = []; //All the ids of clusters that I will depend on in post processing
    //this.futureDependants = []; //All the clusters that will depend on me on post processing
  }

  Cluster.prototype.containsAddin = function (id) {
    return _.findIndex(this.addins, { id: id }) !== -1;
  };

  Cluster.prototype.addBefore = function (id, addin) {
    var index = _.findIndex(this.addins, { id: id });
    if (index !== -1) {
      this.addins.splice(index, 0, addin);
    }
  };

  Cluster.prototype.addAfter = function (id, addin) {
    var index = _.findIndex(this.addins, { id: id });
    if (index !== -1) {
      this.addins.splice(index + 1, 0, addin);
    }
  };

  Cluster.prototype.calculateOrder = function () {
    var addin = _.find(this.addins, function (addin) {
      return _.isNumber(addin.order);
    });
    if (addin) {
      this.order = addin.order;
    }
  };

  /*
  * Returns a cluster that contains the given id or null if no cluster contains this id
  */
  function findCluster(clusters, id) {
    var i;
    for (i = 0; i < clusters.length; i++) {
      if (clusters[i].containsAddin(id)) {
        return clusters[i];
      }
    }

    return null;
  }

  function formSortClusters(addins) {
    var clusters = [];
    var currentAddins = addins;
    var remainingAddins = [];
    var i, addin;
    var targetId = null;
    var cluster = null;
    var newCluster = null;

    while (currentAddins.length > 0) {
      for (i = 0; i < remainingAddins.length; i++) {
        addin = remainingAddins[i];
        if (_.isString(addin.order)) { //cases of <, <<, >, >>
          if (_.indexOf(addin.order, '>') === 0) { //cases of > and >>
            if (_.indexOf(addin.order, '>', 1) === 1) { // case of >>
              targetId = addin.order.substring(2);
              cluster = findCluster(clusters, targetId);
              if (cluster) { //Found the id in some other cluster so I need to be in a new cluster that depends on it
                newCluster = new Cluster(addin);
                newCluster.dependsOnClusters.push(cluster);
                clusters.push(newCluster);
              } else { //The cluster which my cluster depends on doesn't exist yet so store the id for post processing
                remainingAddins.push(addin);
              }
            } else { //case of >
              targetId = addin.order.substring(1);
              cluster = findCluster(clusters, targetId);
              if (cluster) {//My target is already in a cluster
                cluster.addAfter(targetId, addin);
              } else {
                remainingAddins.push(addin);
              }
            }
          }
        }
      }

      if (currentAddins.length === remainingAddins.length) {
        throw new Error('Unable to determine topological order for addins ' + JSON.stringify(remainingAddins));
      }

      currentAddins = remainingAddins;
      remainingAddins = [];
    }
  }

  if (!EJS.utils) {
    EJS.utils = {};
  }

  EJS.utils.topologicalSort = function (addins) { };


})(window.EJS || (window.EJS = {}));