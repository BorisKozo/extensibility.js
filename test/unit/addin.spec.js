describe('Addin', function () {
    'use strict';
    var expect;
    var subdivision;
    if (typeof window === 'undefined') {
        expect = require('chai').expect;
        subdivision = require('./../../dist/subdivision.node.js');
    } else {
        expect = chai.expect;
        subdivision = window.subdivision;
    }

    afterEach(function () {
        subdivision.registry.$clear();
        subdivision.$clearBuilders();
        subdivision.$clearConditions();
    });

    describe('Create an addin', function () {
        it('Should create an addin without options', function () {
            var addin = new subdivision.Addin();
            expect(addin.id.indexOf('addin')).to.be.equal(0);
            expect(addin.order).to.be.equal(0);
            var addin2 = new subdivision.Addin();
            expect(addin.id).not.to.be.equal(addin2.id);
        });

        it('Should create an addin with options function', function () {
            var addin = new subdivision.Addin(function () {
                return {
                    id: 'abc',
                    order: 3
                };
            });
            expect(addin.id).to.be.equal('abc');
            expect(addin.order).to.be.equal(3);
        });

        it('Should create an addin with options object', function () {
            var addin = new subdivision.Addin({
                id: 'abc',
                order: 3
            });
            expect(addin.id).to.be.equal('abc');
            expect(addin.order).to.be.equal(3);
        });
    });

    describe('Add Addin', function () {
        it('should add an addin to a specific node', function () {
            var addin = new subdivision.Addin({});
            subdivision.addAddin('a/b/c', addin);
            expect(subdivision.getAddins('a/b/c')[0]).to.be.equal(addin);
        });

        it('should create a node if the addin is undefined', function () {
            subdivision.addAddin('a/b/c');
            expect(subdivision.registry.pathExists('a/b/c')).to.be.true;
        });

        it('should throw if path was undefined', function () {
            expect(function () {
                subdivision.addAddin();
            }).to.throw('path was not defined for addin');
        });
    });

    describe('Get Addins', function () {
        it('should not get addins of non existing node', function () {
            expect(subdivision.getAddins('abv/ccc/a').length).to.be.equal(0);
        });

        it('should get all addins of a node', function () {
            var addin1 = new subdivision.Addin({order: 1});
            var addin2 = new subdivision.Addin({order: 2});
            subdivision.addAddin('ab/cd', addin1);
            subdivision.addAddin('ab/cd', addin2);
            expect(subdivision.getAddins('ab/cd')).to.be.eql([addin1, addin2]);
        });

        it('should get all addins of a node with the dedicated function', function () {
            var addin1 = new subdivision.Addin({order: 1});
            var addin2 = new subdivision.Addin({order: 2, isEnabled: false});
            subdivision.addAddin('ab/cd', addin1);
            subdivision.addAddin('ab/cd', addin2);
            expect(subdivision.getAllAddins('ab/cd')).to.be.eql([addin1, addin2]);
        });

        it('should get all addins of a node with a specific property', function () {
            var addin1 = new subdivision.Addin({id: '1'});
            var addin2 = new subdivision.Addin({id: '2'});
            subdivision.addAddin('ab/cd', addin1);
            subdivision.addAddin('ab/cd', addin2);
            expect(subdivision.getAddins('ab/cd', {id: '1'})).to.be.eql([addin1]);
        });

        it('should get all addins of a node without topological sort', function () {
            var addin1 = new subdivision.Addin({id: '1', order: 1});
            var addin2 = new subdivision.Addin({id: '2', order: 0});
            var addin3 = new subdivision.Addin({id: '3', order: 2});
            subdivision.addAddin('ab/cd', addin1);
            subdivision.addAddin('ab/cd', addin2);
            subdivision.addAddin('ab/cd', addin3);
            var addins = subdivision.getAddins('ab/cd', null, true);
            expect(addins.length).to.be.equal(3);
            expect(addins[0].id).to.be.equal('1');
            expect(addins[1].id).to.be.equal('2');
            expect(addins[2].id).to.be.equal('3');
        });

    });

    describe('isEnabled flag', function () {
        it('should disable an addin with boolean', function () {
            var addin1 = new subdivision.Addin({isEnabled: false});
            var addin2 = new subdivision.Addin({isEnabled: true});
            subdivision.addAddin('a', addin1);
            subdivision.addAddin('a', addin2);
            expect(subdivision.getAddins('a')).to.be.eql([addin2]);
        });

        it('should disable addins with function', function () {
            var addin1 = new subdivision.Addin({
                isEnabled: function () {
                    return false;
                }
            });
            var addin2 = new subdivision.Addin({
                isEnabled: function () {
                    return true;
                }
            });
            subdivision.addAddin('a', addin1);
            subdivision.addAddin('a', addin2);
            expect(subdivision.getAddins('a')).to.be.eql([addin2]);
        });

        it('should disable addins with string', function () {

            subdivision.addCondition({
                name: 'falseCondition',
                isValid: function () {
                    return false;
                }
            });

            subdivision.addCondition({
                name: 'trueCondition',
                isValid: function () {
                    return true;
                }
            });


            var addin1 = new subdivision.Addin({
                isEnabled: 'falseCondition'
            });
            var addin2 = new subdivision.Addin({
                isEnabled: 'trueCondition'
            });
            subdivision.addAddin('a', addin1);
            subdivision.addAddin('a', addin2);
            expect(subdivision.getAddins('a')).to.be.eql([addin2]);
        });

        it('should disable addins with complex string condition', function () {
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.$generateBuilders();
            subdivision.addCondition({
                name: 'falseCondition',
                isValid: function () {
                    return false;
                }
            });

            subdivision.addCondition({
                name: 'trueCondition',
                isValid: function () {
                    return true;
                }
            });


            var addin1 = new subdivision.Addin({
                isEnabled: 'falseCondition & trueCondition'
            });
            var addin2 = new subdivision.Addin({
                isEnabled: 'trueCondition | trueCondition'
            });
            subdivision.addAddin('a', addin1);
            subdivision.addAddin('a', addin2);
            expect(subdivision.getAddins('a')).to.be.eql([addin2]);
        });

        it('should disable addins with unsupported value provided', function () {
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.$generateBuilders();

            var addin1 = new subdivision.Addin({
                isEnabled: {}
            });
            subdivision.addAddin('a', addin1);
            expect(subdivision.getAddins('a')).to.be.eql([]);
        });

    });
});