describe('Service', function () {
    'use strict';
    var expect = chai.expect;
    var EJS = window.EJS;

    beforeEach(function () {
        EJS.clearServices();
    });

    describe('Create a service', function () {
        it('should create a service without a prototype', function () {
            var service = new EJS.Service({});
            expect(service.$vent).to.be.ok;
            expect(service.$next).to.be.undefined;
        });

        it('should create a service with a prototype', function () {
            var otherService = {};
            var service = new EJS.Service({}, otherService);
            expect(service.$next).to.be.eql(otherService);
        });

        it('should extend the created service with the options', function () {
            var service = new EJS.Service({a: 'a'});
            expect(service.a).to.be.equal('a');
        });

        it('should extend the created service with the options function result', function () {
            var service = new EJS.Service(function () {
                return {
                    a: 'a'
                };
            });
            expect(service.a).to.be.equal('a');
        });
    });

    describe('addService', function () {
        it('should add a service', function () {
            EJS.addService('moo', {b: 'bb'});
            var service = EJS.getService('moo');
            expect(service).to.be.ok;
            expect(service.b).to.be.equal('bb');
        });

        it('should add a service with inheritance', function () {
            EJS.addService('moo', {b: 'bb'});
            EJS.addService('moo', {c: 'cc'});
            var service = EJS.getService('moo');
            expect(service).to.be.ok;
            expect(service.b).to.be.equal('bb');
            expect(service.c).to.be.equal('cc');
            expect(service.$next.b).to.be.equal('bb');
            expect(service.$next.c).to.be.undefined;
        });

        it('should add a service with override', function () {
            EJS.addService('moo', {b: 'bb'});
            EJS.addService('moo', {c: 'cc'}, true);
            var service = EJS.getService('moo');
            expect(service).to.be.ok;
            expect(service.b).to.be.undefined;
            expect(service.c).to.be.equal('cc');
            expect(service.$next).to.be.undefined;
        });
    });

    describe('getService', function () {
        it('should get a service', function () {
            EJS.addService('monkey', {});
            var service = EJS.getService('monkey');
            expect(service).to.be.ok;
        });

        it('should not get a service if it was undefined', function () {
            var service = EJS.getService('monkey');
            expect(service).to.be.undefined;
        });
    });

    describe('buildServices', function () {
        it('should build the services path', function (done) {
            EJS.addBuilder(EJS.Service.builder);
            EJS.readManifest({
                paths: [
                    {
                        path: EJS.systemServicesPath,
                        addins: [
                            {
                                id: 'service1',
                                name: 'monkey',
                                type: 'EJS.service',
                                order: 1,
                                content: {
                                    a: 'aa',
                                    initialize: sinon.stub()
                                }
                            },
                            {
                                id: 'service2',
                                name: 'monkey',
                                type: 'EJS.service',
                                order: '>service1',
                                content: {
                                    b: 'bb',
                                    initialize: sinon.stub()
                                }
                            },
                            {
                                id: 'service3',
                                name: 'monkey',
                                type: 'EJS.service',
                                order: '>service2',
                                content: {
                                    c: 'cc'
                                }
                            }
                        ]
                    }
                ]
            });
            var triggerSpy = sinon.spy(EJS.vent, 'trigger');

            EJS.buildServices().then(function () {
                var service = EJS.getService('monkey');
                expect(service).to.be.ok;
                expect(service.a).to.be.equal('aa');
                expect(service.b).to.be.equal('bb');
                expect(service.$next).to.be.ok;
                expect(service.initialize.called).to.be.true;
                expect(service.$next.initialize.called).to.be.true;
                expect(triggerSpy.calledWith('before:service:initialized', 'monkey')).to.be.true;
                expect(triggerSpy.calledWith('after:service:initialized', 'monkey')).to.be.true;
                done();
            });
        });
    });

    describe('service builder', function () {
        it('should throw an error if name was not defined', function () {
            expect(function () {
                EJS.Service.builder.build(
                    {
                        id: 'service1',
                        type: 'EJS.service',
                        order: 1,
                        content: {
                            a: 'aa'
                        }
                    });
            }).to.throw('Service name must be defined');
        });
    });
});