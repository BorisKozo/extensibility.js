describe('Builder', function () {
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

    beforeEach(function () {
        subdivision.$clearBuilders();
        subdivision.registry.$clear();
    });

    describe('Create a builder', function () {
        it('should throw if there was no build function defined', function () {
            expect(function () {
                new subdivision.Builder();
            }).to.throw('Builder options must contain the "build" function');
        });

        it('Should create a builder without options', function () {
            var builder = new subdivision.Builder({
                build: function () {
                }
            });
            expect(builder.id.indexOf('builder')).to.be.equal(0);
            expect(builder.order).to.be.equal(0);
            expect(builder.target).to.be.equal('');
            var builder2 = new subdivision.Builder({
                build: function () {
                }
            });
            expect(builder.id).not.to.be.equal(builder2.id);
        });

        it('Should create an addin with options function', function () {
            var builder = new subdivision.Builder(function () {
                return {
                    id: 'abc',
                    order: 3,
                    target: 'monkey',
                    build: function () {
                    }
                }
            });
            expect(builder.id).to.be.equal('abc');
            expect(builder.order).to.be.equal(3);
            expect(builder.target).to.be.equal('monkey');
        });

        it('Should create an addin with options object', function () {
            var builder = new subdivision.Builder({
                id: 'abc',
                order: 3,
                target: 'monkey',
                build: function () {
                }
            });
            expect(builder.id).to.be.equal('abc');
            expect(builder.order).to.be.equal(3);
            expect(builder.target).to.be.equal('monkey');
        });
    });

    describe('Add a builder', function () {
        it('should add a builder', function () {
            var options = {
                id: 'abc',
                order: 3,
                target: 'monkey',
                build: function () {
                }
            };

            subdivision.addBuilder(options);
            var builder = subdivision.getBuilder('monkey');
            expect(builder.id).to.be.equal('abc');
            expect(builder.order).to.be.equal(3);
            expect(builder.target).to.be.equal('monkey');
        });
    });

    describe('Get builder', function () {
        it('should get a builder with the given type', function () {
            var options = {
                target: 'monkey',
                build: function () {
                }
            };

            subdivision.addBuilder(options);
            var builder = subdivision.getBuilder('monkey');
            expect(builder.target).to.be.equal('monkey');
        });

        it('should get the default builder', function () {
            var options = {
                id: 'hello',
                target: null,
                build: function () {
                }
            };

            subdivision.addBuilder(options, true);
            var builder = subdivision.getBuilder(null);
            expect(builder.id).to.be.equal('hello');
        });


        it('should get a builder with type === null if no appropriate builder is found', function () {
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function () {
                }
            });

            subdivision.addBuilder({
                id: 'b',
                target: null,
                build: function () {
                }
            });

            var builder = subdivision.getBuilder('no such type');
            expect(builder.id).to.be.equal('b');
        });

        it('should throw if there is no default builder and no appropriate builder is found', function () {
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function () {
                }
            });
            expect(function () {
                subdivision.getBuilder('no such type');
            }).to.throw('No builder of type "no such type" was defined and no default builder was registered');
        });

        it('should get the correct builder if it was overridden', function () {
            var options1 = {
                target: 'monkey',
                order: 10,
                build: function () {
                }
            };
            var options2 = {
                target: 'monkey',
                order: 100,
                build: function () {
                }
            };


            subdivision.addBuilder(options1);
            subdivision.addBuilder(options2);
            var builder = subdivision.getBuilder('monkey');
            expect(builder.order).to.be.equal(10);
        });


    });

    describe('Build', function () {
        it('should build a path with a couple of addins in it', function () {
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin) {
                    return addin.id;
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            var items = subdivision.build('aaa');
            expect(items).to.be.ok;
            expect(items.length).to.be.equal(2);
            expect(items[0]).to.be.equal('1');
            expect(items[1]).to.be.equal('2');
        });

        it('should return empty array if there are no addins to build', function () {
            subdivision.addBuilder({
                id: 'a',
                target: 'mouse',
                build: function (addin) {
                    return addin.id;
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            var items = subdivision.build('bbb');
            expect(items.length).to.be.equal(0);
        });

        it('should pass the options to the build function', function () {
            var options = {};
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin, innerOptions) {
                    expect(innerOptions).to.be.equal(options);
                    return addin.id;
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            var items = subdivision.build('aaa', options);
            expect(items.length).to.be.equal(2);
        });

        it('should pre-build if preBuildTarget was specified', function () {
            subdivision.addBuilder({
                target: 'monkey',
                preBuildTarget: 'cow',
                build: function (addin) {
                    return addin + '!';
                }
            });
            subdivision.addBuilder({
                target: 'cow',
                build: function (addin) {
                    return '*' + addin.id + '*';
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            var items = subdivision.build('aaa');
            expect(items).to.be.ok;
            expect(items.length).to.be.equal(2);
            expect(items[0]).to.be.equal('*1*!');
            expect(items[1]).to.be.equal('*2*!');
        });

        it('should provide the path in the metadata', function () {
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin, options, metadata) {
                    return metadata.path;
                }
            });

            subdivision.addAddin('aaa/bbb', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa/bbb', {id: '2', type: 'monkey', order: 2});

            var items = subdivision.build('aaa/bbb');
            expect(items).to.be.ok;
            expect(items.length).to.be.equal(2);
            expect(items[0]).to.be.equal('aaa/bbb');
            expect(items[1]).to.be.equal('aaa/bbb');
        });

    });

    describe('Build Async', function () {
        it('should build a path with a couple of addins in it', function (done) {
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin) {
                    return addin.id;
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            subdivision.build.async('aaa').then(function (items) {
                expect(items).to.be.ok;
                expect(items.length).to.be.equal(2);
                expect(items[0]).to.be.equal('1');
                expect(items[1]).to.be.equal('2');
                done();
            });
        });

        it('should build a path with a couple of addins in it (async build)', function (done) {
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin) {
                    return new Promise(function (resolver) {
                        setTimeout(function () {
                            resolver(addin.id);
                        }, 0);
                    });
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            subdivision.build.async('aaa').then(function (items) {
                expect(items).to.be.ok;
                expect(items.length).to.be.equal(2);
                expect(items[0]).to.be.equal('1');
                expect(items[1]).to.be.equal('2');
                done();
            });
        });

        it('should return empty array if there are no addins to build', function (done) {
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin) {
                    return addin.id;
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            subdivision.build.async('bbb').then(function (items) {
                expect(items.length).to.be.equal(0);
                done();
            });
        });

        it('should fail if there is an error during build', function (done) {
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin) {
                    throw new Error('Hello');
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            subdivision.build.async('aaa').then(function () {
                done('Should not get here');
            }, function (error) {
                expect(error.message).to.be.equal('Hello');
                done();
            });
        });

        it('should build a path with a couple of addins in it with options', function (done) {
            var options = {};

            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin, innerOptions) {
                    expect(innerOptions).to.be.equal(options);
                    return addin.id;
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            subdivision.build.async('aaa', options).then(function (items) {
                expect(items).to.be.ok;
                expect(items.length).to.be.equal(2);
                expect(items[0]).to.be.equal('1');
                expect(items[1]).to.be.equal('2');
                done();
            });
        });

        it('should pre-build if preBuildTarget was specified', function (done) {
            subdivision.addBuilder({
                target: 'monkey',
                preBuildTarget: 'cow',
                build: function (addin) {
                    return addin + '!';
                }
            });
            subdivision.addBuilder({
                target: 'cow',
                build: function (addin) {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve('*' + addin.id + '*');
                        }, 1);
                    });
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            subdivision.build.async('aaa').then(function (items) {
                expect(items).to.be.ok;
                expect(items.length).to.be.equal(2);
                expect(items[0]).to.be.equal('*1*!');
                expect(items[1]).to.be.equal('*2*!');
                done();
            });
        });

        it('should provide the path in the metadata', function () {
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin, options, metadata) {
                    return metadata.path;
                }
            });

            subdivision.addAddin('aaa/bbb', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa/bbb', {id: '2', type: 'monkey', order: 2});

            subdivision.build.async('aaa/bbb').then(function (items) {
                expect(items).to.be.ok;
                expect(items.length).to.be.equal(2);
                expect(items[0]).to.be.equal('aaa/bbb');
                expect(items[1]).to.be.equal('aaa/bbb');
            });
        });
    });

    describe('Build Tree', function () {
        it('should build a path tree', function () {
            var options = {};
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin, innerOptions) {
                    expect(innerOptions).to.be.equal(options);
                    return {id: addin.id};
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});
            subdivision.addAddin('aaa', {id: '3', type: 'monkey', order: 3, itemsProperty: 'stuff'});
            subdivision.addAddin(subdivision.registry.joinPath('aaa', '2'), {id: '1', type: 'monkey', order: 2});
            subdivision.addAddin(subdivision.registry.joinPath('aaa', '2'), {id: '2', type: 'monkey', order: 3});
            subdivision.addAddin(subdivision.registry.joinPath('aaa', '3'), {id: '1', type: 'monkey', order: 3});

            var items = subdivision.buildTree('aaa', options);
            expect(items).to.be.ok;
            expect(items.length).to.be.equal(3);
            expect(items[1].$items.length).to.be.equal(2);
            expect(items[1].$items[0].id).to.be.equal('1');
            expect(items[2].$items).to.be.undefined;
            expect(items[2].stuff.length).to.be.equal(1);
            expect(items[2].stuff[0].id).to.be.equal('1');
        });

    });

    describe('Build addin', function () {
        it('should build an addin', function () {
            var options = {};
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin, innerOptions) {
                    expect(innerOptions).to.be.equal(options);
                    return addin.id;
                }
            });

            var addin = {id: '1', type: 'monkey', order: 1};
            var result = subdivision.buildAddin(addin, options);
            expect(result).to.be.equal('1');
        });

        it('should not build if no builder exists and return undefined', function () {
            expect(function () {
                var addin = {id: '1', type: 'monkey', order: 1};
                subdivision.buildAddin(addin);
            }).to.throw('No builder of type "monkey" was defined');

        });

        it('should pre-build if preBuildTarget was specified', function () {
            subdivision.addBuilder({
                target: 'monkey',
                preBuildTarget: 'cow',
                build: function (addin) {
                    return addin + '!';
                }
            });
            subdivision.addBuilder({
                target: 'cow',
                build: function (addin) {
                    return '*' + addin.id + '*';
                }
            });

            var addin = {id: '1', type: 'monkey', order: 1};
            var result = subdivision.buildAddin(addin, {});
            expect(result).to.be.equal('*1*!');
        });

        it('should build an addin with metadata', function () {
            var options = {};
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin, options, metadata) {
                    expect(metadata.path).to.be.null;
                    return addin.id;
                }
            });

            var addin = {id: '1', type: 'monkey', order: 1};
            var result = subdivision.buildAddin(addin, options);
            expect(result).to.be.equal('1');
        });
    });

    describe('Build addin async', function () {
        it('should build an addin', function (done) {
            var options = {};
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin, innerOptions) {
                    expect(innerOptions).to.be.equal(options);
                    return addin.id;
                }
            });

            var addin = {id: '1', type: 'monkey', order: 1};
            subdivision.buildAddin.async(addin, options).then(function (result) {
                expect(result).to.be.equal('1');
                done();
            });
        });

        it('should not build if no builder exists and reject the promise', function (done) {

            var addin = {id: '1', type: 'monkey', order: 1};
            subdivision.buildAddin.async(addin).catch(function (exception) {
                expect(exception.message).to.contain('No builder of type "monkey" was defined');
                done();
            });


        });

        it('should pre-build if preBuildTarget was specified', function (done) {
            subdivision.addBuilder({
                target: 'monkey',
                preBuildTarget: 'cow',
                build: function (addin) {
                    return addin + '!';
                }
            });
            subdivision.addBuilder({
                target: 'cow',
                build: function (addin) {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve('*' + addin.id + '*');
                        }, 1);
                    });
                }
            });

            var addin = {id: '1', type: 'monkey', order: 1};
            subdivision.buildAddin.async(addin, {}).then(function (result) {
                expect(result).to.be.equal('*1*!');
                done();
            });
        });

    });

});