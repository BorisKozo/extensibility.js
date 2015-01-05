describe('Addin', function () {
    'use strict';
    var expect = chai.expect;
    var EJS = window.EJS;

    afterEach(function () {
        EJS.registry.clear();
    });

    describe('Create an addin', function () {
        it('Should create an addin without options', function () {
            var addin = new EJS.Addin();
            expect(addin.id.indexOf('addin')).to.be.equal(0);
            expect(addin.order).to.be.equal(0);
            var addin2 = new EJS.Addin();
            expect(addin.id).not.to.be.equal(addin2.id);
        });

        it('Should create an addin with options function', function () {
            var addin = new EJS.Addin(function () {
                return {
                    id: 'abc',
                    order: 3
                }
            });
            expect(addin.id).to.be.equal('abc');
            expect(addin.order).to.be.equal(3);
        });

        it('Should create an addin with options object', function () {
            var addin = new EJS.Addin({
                id: 'abc',
                order: 3
            });
            expect(addin.id).to.be.equal('abc');
            expect(addin.order).to.be.equal(3);
        });
    });

    describe('Add Addin', function () {
        it('should add an addin to a specific node', function () {
            var addin = new EJS.Addin({});
            EJS.addAddin('a/b/c', addin);
            expect(EJS.getAddins('a/b/c')[0]).to.be.equal(addin);
        });

        it('should create a node if the addin is undefined', function () {
            EJS.addAddin('a/b/c');
            expect(EJS.registry.nodeExists('a/b/c')).to.be.true;
        });
    });

    describe('Get Addins', function () {
        it('should not get addins of non existing node', function () {
            expect(EJS.getAddins('abv/ccc/a').length).to.be.equal(0);
        });

        it('should get all addins of a node', function () {
            var addin1 = new EJS.Addin({order: 1});
            var addin2 = new EJS.Addin({order: 2});
            EJS.addAddin('ab/cd', addin1);
            EJS.addAddin('ab/cd', addin2);
            expect(EJS.getAddins('ab/cd')).to.be.eql([addin1, addin2]);
        });

        it('should get all addins of a node with a specific property', function () {
            var addin1 = new EJS.Addin({id: '1'});
            var addin2 = new EJS.Addin({id: '2'});
            EJS.addAddin('ab/cd', addin1);
            EJS.addAddin('ab/cd', addin2);
            expect(EJS.getAddins('ab/cd', {id: '1'})).to.be.eql([addin1]);
        });

        it('should get all addins of a node without topological sort', function () {
            var addin1 = new EJS.Addin({id: '1', order: 1});
            var addin2 = new EJS.Addin({id: '2', order: 0});
            var addin3 = new EJS.Addin({id: '3', order: 2});
            EJS.addAddin('ab/cd', addin1);
            EJS.addAddin('ab/cd', addin2);
            EJS.addAddin('ab/cd', addin3);
            var addins = EJS.getAddins('ab/cd', null, true);
            expect(addins.length).to.be.equal(3);
            expect(addins[0].id).to.be.equal('1');
            expect(addins[1].id).to.be.equal('2');
            expect(addins[2].id).to.be.equal('3');
        });

    });
});