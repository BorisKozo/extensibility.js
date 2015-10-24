describe('Service', function () {
    'use strict';
    var expect;
    var subdivision;
    var sinon;
    if (typeof window === 'undefined') {
        expect = require('chai').expect;
        sinon = require('sinon');
        subdivision = require('./../../dist/subdivision.node.js');
    } else {
        expect = chai.expect;
        subdivision = window.subdivision;
        sinon = window.sinon;
    }

    beforeEach(function () {
        subdivision.$clearServices();
    });

    describe('Create a service', function () {
        it('should create a service without a prototype', function () {
            var service = new subdivision.Service({});
            expect(service.$vent).to.be.ok;
            expect(service.$next).to.be.undefined;
        });

        it('should create a service with a prototype', function () {
            var otherService = {};
            var service = new subdivision.Service({}, otherService);
            expect(service.$next).to.be.eql(otherService);
        });

        it('should extend the created service with the options', function () {
            var service = new subdivision.Service({a: 'a'});
            expect(service.a).to.be.equal('a');
        });

        it('should extend the created service with the options function result', function () {
            var service = new subdivision.Service(function () {
                return {
                    a: 'a'
                };
            });
            expect(service.a).to.be.equal('a');
        });
    });

    describe('addService', function () {
        it('should add a service', function () {
            subdivision.addService('moo', {b: 'bb'});
            var service = subdivision.getService('moo');
            expect(service).to.be.ok;
            expect(service.b).to.be.equal('bb');
        });

        it('should add a service with inheritance', function () {
            subdivision.addService('moo', {b: 'bb'});
            subdivision.addService('moo', {c: 'cc'});
            var service = subdivision.getService('moo');
            expect(service).to.be.ok;
            expect(service.b).to.be.equal('bb');
            expect(service.c).to.be.equal('cc');
            expect(service.$next.b).to.be.equal('bb');
            expect(service.$next.c).to.be.undefined;
        });

        it('should add a service with override', function () {
            subdivision.addService('moo', {b: 'bb'});
            subdivision.addService('moo', {c: 'cc'}, true);
            var service = subdivision.getService('moo');
            expect(service).to.be.ok;
            expect(service.b).to.be.undefined;
            expect(service.c).to.be.equal('cc');
            expect(service.$next).to.be.undefined;
        });
    });

    describe('getService', function () {
        it('should get a service', function () {
            subdivision.addService('monkey', {});
            var service = subdivision.getService('monkey');
            expect(service).to.be.ok;
        });

        it('should not get a service if it was undefined', function () {
            var service = subdivision.getService('monkey');
            expect(service).to.be.undefined;
        });
    });

    describe('buildServices', function () {
        beforeEach(function () {
            sinon.spy(subdivision.vent, 'trigger');
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.generateBuilders();
        });

        afterEach(function () {
            subdivision.vent.trigger.restore();
        });

        it('should build the services path', function (done) {

            subdivision.readManifest({
                paths: [
                    {
                        path: subdivision.systemPaths.services,
                        addins: [
                            {
                                id: 'service1',
                                name: 'monkey',
                                type: 'subdivision.service',
                                order: 1,
                                content: {
                                    a: 'aa',
                                    initialize: sinon.stub()
                                }
                            },
                            {
                                id: 'service2',
                                name: 'monkey',
                                type: 'subdivision.service',
                                order: '>service1',
                                content: {
                                    b: 'bb',
                                    initialize: sinon.stub()
                                }
                            },
                            {
                                id: 'service3',
                                name: 'monkey',
                                type: 'subdivision.service',
                                order: '>service2',
                                content: {
                                    c: 'cc'
                                }
                            }
                        ]
                    }
                ]
            });


            subdivision.buildServices().then(function () {
                var service = subdivision.getService('monkey');
                expect(service).to.be.ok;
                expect(service.a).to.be.equal('aa');
                expect(service.b).to.be.equal('bb');
                expect(service.$next).to.be.ok;
                expect(service.initialize.called).to.be.true;
                expect(service.$next.initialize.called).to.be.true;
                expect(subdivision.vent.trigger.calledWith('before:service:initialized', 'monkey')).to.be.true;
                expect(subdivision.vent.trigger.calledWith('after:service:initialized', 'monkey')).to.be.true;
                done();
            });
        });
    });

    describe('service builder', function () {
        beforeEach(function () {
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.generateBuilders();
        });

        it('should throw an error if name was not defined', function () {
            subdivision.readManifest({
                paths: [
                    {
                        path: subdivision.systemPaths.services,
                        addins: [
                            {
                                id: 'service1',
                                type: 'subdivision.service',
                                order: 1,
                                content: {
                                    a: 'aa',
                                    initialize: sinon.stub()
                                }
                            }]
                    }]
            });

            expect(function () {
                subdivision.build(subdivision.systemPaths.services);
            }).to.throw('Service name must be defined');
        });
    });
});