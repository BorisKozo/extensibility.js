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
            EJS.registry.addAddin('a/b/c', addin);
            expect(EJS.registry.getAddins('a/b/c')[0]).to.be.equal(addin);
        });

        it('should create a node if the addin is undefined', function () {
            EJS.registry.addAddin('a/b/c');
            expect(EJS.registry.nodeExists('a/b/c')).to.be.true;
        });
    });

    describe('Get Addins', function () {
        it('should not get addins of non existing node', function () {
            expect(EJS.registry.getAddins('abv/ccc/a')).to.be.null;
        });

        it('should get all addins of a node', function () {
            var addin1 = new EJS.Addin({order: 1});
            var addin2 = new EJS.Addin({order: 2});
            EJS.registry.addAddin('ab/cd', addin1);
            EJS.registry.addAddin('ab/cd', addin2);
            expect(EJS.registry.getAddins('ab/cd')).to.be.eql([addin1, addin2]);
        });

        it('should get all addins of a node with a specific property', function () {
            var addin1 = new EJS.Addin({id: 1});
            var addin2 = new EJS.Addin({id: 2});
            EJS.registry.addAddin('ab/cd', addin1);
            EJS.registry.addAddin('ab/cd', addin2);
            expect(EJS.registry.getAddins('ab/cd', {id: 1})).to.be.eql([addin1]);
        });
    });
});