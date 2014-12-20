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

        function verifyClusterDependency(firstCluster) {
            var i;
            for (i = 1; i < arguments.length; i++) {
                if (firstCluster.dependsOnClusters[arguments[i].id] !== true) {
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
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not fulfill < dependency for 1 because 3 already has the same dependency');

                addins = [];
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                addins.push(new EJS.Addin({id: '3', order: '>1'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not fulfill > dependency for 1 because 3 already has the same dependency');
            });

            it('should throw if direct dependencies contradict', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: '<2'}));
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find appropriate order for 2 and 1');

                addins = [];
                addins.push(new EJS.Addin({id: '1', order: '>2'}));
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find appropriate order for 2 and 1');
            });
        });

        describe('indirect dependency', function () {
            it('should create two clusters of an indirect >> dependency', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '>>1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(2);
                expect(verifyClusterOrder(clusters[0], ['2'])).to.be.true;
                expect(verifyClusterOrder(clusters[1], ['1'])).to.be.true;
                expect(verifyClusterDependency(clusters[0], clusters[1])).to.be.true;
            });

            it('should create two clusters of an indirect << dependency', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '<<1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(2);
                expect(verifyClusterOrder(clusters[0], ['2'])).to.be.true;
                expect(verifyClusterOrder(clusters[1], ['1'])).to.be.true;
                expect(verifyClusterDependency(clusters[1], clusters[0])).to.be.true;
            });

            it('should create three clusters of indirect dependency', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '3', order: '>>1'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '<<1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(3);
                expect(verifyClusterOrder(clusters[0], ['2'])).to.be.true;
                expect(verifyClusterOrder(clusters[1], ['1'])).to.be.true;
                expect(verifyClusterOrder(clusters[2], ['3'])).to.be.true;
                expect(verifyClusterDependency(clusters[1], clusters[0])).to.be.true;
                expect(verifyClusterDependency(clusters[2], clusters[1])).to.be.true;

                addins = [];
                addins.push(new EJS.Addin({id: '3', order: '>>1'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '>>3'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(3);
                expect(verifyClusterOrder(clusters[0], ['2'])).to.be.true;
                expect(verifyClusterOrder(clusters[1], ['1'])).to.be.true;
                expect(verifyClusterOrder(clusters[2], ['3'])).to.be.true;
                expect(verifyClusterDependency(clusters[0], clusters[2])).to.be.true;
                expect(verifyClusterDependency(clusters[2], clusters[1])).to.be.true;

                addins = [];
                addins.push(new EJS.Addin({id: '3', order: '<<1'}));
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '<<3'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(3);
                expect(verifyClusterOrder(clusters[0], ['2'])).to.be.true;
                expect(verifyClusterOrder(clusters[1], ['1'])).to.be.true;
                expect(verifyClusterOrder(clusters[2], ['3'])).to.be.true;
                expect(verifyClusterDependency(clusters[2], clusters[0])).to.be.true;
                expect(verifyClusterDependency(clusters[1], clusters[2])).to.be.true;
            });
        });

        describe('mixed direct and indirect dependency', function () {
            it('should create one cluster if direct and indirect dependencies match', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: '<<2'}));
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['1', '2'])).to.be.true;

                addins = [];
                addins.push(new EJS.Addin({id: '1', order: '>>2'}));
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(1);
                expect(verifyClusterOrder(clusters[0], ['2', '1'])).to.be.true;
            });

            it('should throw if direct and indirect dependencies mismatch', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: '>>2'}));
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find appropriate order for 2 and 1');

                addins = [];
                addins.push(new EJS.Addin({id: '1', order: '<<2'}));
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find appropriate order for 2 and 1');

                addins = [];
                addins.push(new EJS.Addin({id: '2', order: '<1'}));
                addins.push(new EJS.Addin({id: '1', order: '<<2'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find appropriate order for 1 and 2');

                addins = [];
                addins.push(new EJS.Addin({id: '2', order: '>1'}));
                addins.push(new EJS.Addin({id: '1', order: '>>2'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find appropriate order for 1 and 2');

            });
        });

        describe('multiple indirect dependencies', function () {
            it('should order correctly for multiple indirect dependencies', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '3', order: '>>1'}));
                addins.push(new EJS.Addin({id: '2', order: '>>1,>>3'}));
                var clusters = EJS.utils.topologicalSort._formSortClusters(addins);
                expect(clusters.length).to.be.equal(3);
                expect(verifyClusterOrder(clusters[0], ['2'])).to.be.true;
                expect(verifyClusterOrder(clusters[1], ['3'])).to.be.true;
                expect(verifyClusterOrder(clusters[2], ['1'])).to.be.true;
                expect(verifyClusterDependency(clusters[0], clusters[1], clusters[2])).to.be.true;
                expect(verifyClusterDependency(clusters[1], clusters[2])).to.be.true;
            });
        });

        describe('general errors', function () {
            it('should throw if referencing an not existing id', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '>33'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find cluster with id 33 for > dependency');

                addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '<33'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find cluster with id 33 for < dependency');

                addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '>>33'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find cluster with id 33 for >> dependency');

                addins = [];
                addins.push(new EJS.Addin({id: '1', order: 0}));
                addins.push(new EJS.Addin({id: '2', order: '<<33'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('Could not find cluster with id 33 for << dependency');

            });

            it('should throw if order is in an incorrect format', function () {
                var addins = [];
                addins.push(new EJS.Addin({id: '1', order: true}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('order must begin with <, <<, >, >> or be a number');

                addins = [];
                addins.push(new EJS.Addin({id: '1', order: 'moo'}));
                expect(function () {
                    EJS.utils.topologicalSort._formSortClusters(addins);
                }).to.throw('order must begin with <, <<, >, >> or be a number');
            });
        });


    });

    describe('topologicalSort', function () {
        function verifyAddinsOrder(addins, ids) {
            var i;
            if (addins.length !== ids.length) {
                return false;
            }
            for (i = 0; i < addins.length; i++) {
                if (addins[i].id !== ids[i]) {
                    return false;
                }
            }

            return true;
        }

        it('should properly sort two dependant addins', function () {
            var addins = [];
            addins.push(new EJS.Addin({id: '1', order: 0}));
            addins.push(new EJS.Addin({id: '2', order: '>>1'}));
            var result = EJS.utils.topologicalSort(addins);
            expect(result.length).to.be.equal(2);
            expect(verifyAddinsOrder(result, ['1', '2'])).to.be.true;

            addins = [];
            addins.push(new EJS.Addin({id: '2', order: '>>1'}));
            addins.push(new EJS.Addin({id: '1', order: 0}));
            var result = EJS.utils.topologicalSort(addins);
            expect(result.length).to.be.equal(2);
            expect(verifyAddinsOrder(result, ['1', '2'])).to.be.true;
        });

        it('should properly sort numerical ordered addins', function () {
            var addins = [];
            addins.push(new EJS.Addin({id: '1', order: 10}));
            addins.push(new EJS.Addin({id: '2', order: 0}));
            addins.push(new EJS.Addin({id: '3', order: 20}));
            addins.push(new EJS.Addin({id: '4', order: 30}));
            addins.push(new EJS.Addin({id: '5', order: 25}));
            var result = EJS.utils.topologicalSort(addins);
            expect(result.length).to.be.equal(5);
            expect(verifyAddinsOrder(result, ['2', '1', '3', '5', '4'])).to.be.true;
        });

        it('should properly sort mixed ordered addins', function () {
            var addins = [];
            addins.push(new EJS.Addin({id: '1', order: 10}));
            addins.push(new EJS.Addin({id: '2', order: '>1'}));
            addins.push(new EJS.Addin({id: '3', order: '>>2'}));
            addins.push(new EJS.Addin({id: '4', order: 20}));
            addins.push(new EJS.Addin({id: '5', order: '<4'}));
            var result = EJS.utils.topologicalSort(addins);
            expect(result.length).to.be.equal(5);
            expect(verifyAddinsOrder(result, ['1', '2', '5', '4', '3'])).to.be.true;

        });

        it('should throw if circular dependency is found', function () {
            var addins = [];
            addins.push(new EJS.Addin({id: '1', order: '>>3'}));
            addins.push(new EJS.Addin({id: '2', order: '>>1'}));
            addins.push(new EJS.Addin({id: '3', order: '>>2'}));
            expect(function () {
                EJS.utils.topologicalSort(addins);
            }).to.throw('Circular dependency detected in topological sort')

        });

        it('should properly sort multiple indirect dependencies', function () {
            var addins = [];
            addins.push(new EJS.Addin({id: '3', order: '>>1'}));
            addins.push(new EJS.Addin({id: '1', order: 0}));
            addins.push(new EJS.Addin({id: '2', order: '>>1,>>3'}));
            var result = EJS.utils.topologicalSort(addins);
            expect(result.length).to.be.equal(3);
            expect(verifyAddinsOrder(result, ['1', '3', '2'])).to.be.true;

            addins = [];
            addins.push(new EJS.Addin({id: '1', order: 0}));
            addins.push(new EJS.Addin({id: '2', order: '>>1,>>3'}));
            addins.push(new EJS.Addin({id: '3', order: '>>1'}));
            var result = EJS.utils.topologicalSort(addins);
            expect(result.length).to.be.equal(3);
            expect(verifyAddinsOrder(result, ['1', '3', '2'])).to.be.true;

            addins = [];
            addins.push(new EJS.Addin({id: '1', order: 0}));
            addins.push(new EJS.Addin({id: '2', order: '<<1,<<3'}));
            addins.push(new EJS.Addin({id: '3', order: '>>2,<<1'}));
            var result = EJS.utils.topologicalSort(addins);
            expect(result.length).to.be.equal(3);
            expect(verifyAddinsOrder(result, ['2', '3', '1'])).to.be.true;
        });

        it('should properly sort multiple indirect dependencies with direct dependencies', function () {
            var addins = [];
            addins.push(new EJS.Addin({id: '1', order: 0}));
            addins.push(new EJS.Addin({id: '2', order: '<<3,<1'}));
            addins.push(new EJS.Addin({id: '3', order: 20}));
            addins.push(new EJS.Addin({id: '4', order: '>>2,>3'}));
            var result = EJS.utils.topologicalSort(addins);
            expect(result.length).to.be.equal(4);
            expect(verifyAddinsOrder(result, ['2', '1', '3', '4'])).to.be.true;
        });

        it('should throw if direct dependency was not used in the end of a dependency list', function () {
            var addins = [];
            addins.push(new EJS.Addin({id: '1', order: 0}));
            addins.push(new EJS.Addin({id: '2', order: '<1,<<3'}));
            addins.push(new EJS.Addin({id: '3', order: 20}));
            expect(function () {
                EJS.utils.topologicalSort(addins);
            }).to.throw('< dependency must be last in <1,<<3 at 2');

            addins = [];
            addins.push(new EJS.Addin({id: '1', order: 0}));
            addins.push(new EJS.Addin({id: '2', order: '>1,<<3'}));
            addins.push(new EJS.Addin({id: '3', order: 20}));
            expect(function () {
                EJS.utils.topologicalSort(addins);
            }).to.throw('> dependency must be last in >1,<<3 at 2');

        });

    });

});
 