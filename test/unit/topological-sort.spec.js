describe('Topological Sort', function () {
    'use strict';
    var expect = chai.expect;
    var EJS = window.EJS;
    describe('formSortClusters', function () {
        function verifyClusterOrder(cluster, order) {
            if (cluster.addins.length !== order.length) {
                return false;
            }
            var i;
            for (i = 0; i < order.length; i++) {
                if (cluster.addins[i].id !== order[i]) {
                    return false;
                }
            }

            return true;
        }

        function verifyClusterDependency(firstCluster){
            var i;
            for (i=1;i<arguments.length;i++){
                if (firstCluster.dependsOnClusters[arguments[i].id] !== true){
                    return false;
                }
            }
            return true;
        }

        describe('direct dependency', function () {
            it('should create one cluster for single direct dependency >', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['1', '2'])).to.be.true;

                addins = [];
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['1', '2'])).to.be.true;

                addins = [];
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                addins.push(new EJS.Addin({id: '3', order: '>2'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['1', '2', '3'])).to.be.true;
            });

            it('should create one cluster for single direct dependency <', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['2', '1'])).to.be.true;

                addins = [];
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['2', '1'])).to.be.true;

                addins = [];
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                addins.push(new EJS.Addin({id: '3', order: '<2'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['3', '2', '1'])).to.be.true;
            });

            it('should create one cluster for mixed direct dependencies', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                addins.push(new EJS.Addin({id: '3', order: '>1'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['2', '1', '3'])).to.be.true;
            });

            it('should create one cluster for mutual direct dependencies', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: '<2'}));
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['1', '2'])).to.be.true;

                addins = [];
                addins.push(new EJS.Addin({id: '1', order: '>2'}));
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['2', '1'])).to.be.true;
            });

            it('should throw if direct dependencies collide', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                addins.push(new EJS.Addin({id: '3', order: '<1'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                expect(function(){
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not fulfill < dependency for 1 because 3 already has the same dependency');

                addins = [];
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                addins.push(new EJS.Addin({id: '3', order: '>1'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                expect(function(){
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not fulfill > dependency for 1 because 3 already has the same dependency');
            });
        });

        describe('indirect dependency', function(){
           it('should create two clusters of an indirect >> dependency', function(){
               var addins = [];
               addins.push(new EJS.Addin({id: '1', order: 0}));
               addins.push(new EJS.Addin({id: '2', order: '>>1'}));
               var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
               expect(clusters.length).to.be.equal(2);
               expect(verifyClusterOrder(clusters[0], ['2'])).to.be.true;
               expect(verifyClusterOrder(clusters[1], ['1'])).to.be.true;
               expect(verifyClusterDependency(clusters[0],clusters[1])).to.be.true;
           });

            it('should create two clusters of an indirect << dependency', function(){
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '<<1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(2);
                expect(verifyClusterOrder(clusters[0], ['2'])).to.be.true;
                expect(verifyClusterOrder(clusters[1], ['1'])).to.be.true;
                expect(verifyClusterDependency(clusters[1],clusters[0])).to.be.true;
            });
        });
    });

});
 