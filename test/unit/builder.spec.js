describe('Builder', function () {
    'use strict';
    var expect = chai.expect;
    var EJS = window.EJS;

    afterEach(function () {
        EJS.registry.clear();
    });

    describe('Create a builder', function () {
        it('Should create a builder without options', function () {
            var builder = new EJS.Builder();
            expect(builder.id.indexOf('builder')).to.be.equal(0);
            expect(builder.order).to.be.equal(0);
            expect(builder.type).to.be.equal('');
            var builder2 = new EJS.Builder();
            expect(builder.id).not.to.be.equal(builder2.id);
        });

        it('Should create an addin with options function', function () {
            var builder = new EJS.Builder(function () {
                return {
                    id: 'abc',
                    order: 3,
                    type:'monkey'
                }
            });
            expect(builder.id).to.be.equal('abc');
            expect(builder.order).to.be.equal(3);
            expect(builder.type).to.be.equal('monkey');
        });

        it('Should create an addin with options object', function () {
            var builder = new EJS.Builder({
                id: 'abc',
                order: 3,
                type:'monkey'
            });
            expect(builder.id).to.be.equal('abc');
            expect(builder.order).to.be.equal(3);
            expect(builder.type).to.be.equal('monkey');
        });
    });

    describe('Add a builder', function () {
    });

    describe('Get builders', function () {
    });

    describe('Build', function () {
    });
});