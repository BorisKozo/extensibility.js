describe('App', function () {
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
        sinon.spy(subdivision.vent, 'trigger');
    });

    afterEach(function () {
        subdivision.vent.trigger.restore();
    });

    it('should start subdivision', function (done) {
        subdivision.readManifest(subdivision.defaultManifest);

        subdivision.readManifest({
            paths: [
                {
                    path: subdivision.systemPaths.services,
                    addins: [
                        {
                            type: 'subdivision.service',
                            name: 'cow',
                            content: {
                                hello: 'world'
                            }
                        }
                    ]
                },
                {
                    path: subdivision.systemPaths.commands,
                    addins: [
                        {
                            type: 'subdivision.command',
                            name: 'cow',
                            execute: function () {
                            }
                        }
                    ]
                }
            ]
        });


        subdivision.start().then(function () {
            expect(subdivision.vent.trigger.calledWith('before:buildServices')).to.be.true;
            expect(subdivision.vent.trigger.calledWith('after:buildServices')).to.be.true;
            var service = subdivision.getService('cow');
            expect(service).to.be.ok;
            expect(service.hello).to.be.equal('world');
            done();
        }).catch(function (error) {
            done(error);
        });

    });

    it('should trigger start events when subdivision starts', function (done) {
        subdivision.readManifest(subdivision.defaultManifest);

        subdivision.start().then(function () {
            expect(subdivision.vent.trigger.calledWith('before:start')).to.be.true;
            expect(subdivision.vent.trigger.calledWith('after:start')).to.be.true;
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    it('should start subdivision if no buildServices is defined', function () {
        var temp = subdivision.buildServices;
        subdivision.readManifest(subdivision.defaultManifest);

        subdivision.readManifest({
            paths: [
                {
                    path: subdivision.systemPaths.services,
                    addins: [
                        {
                            type: 'subdivision.service',
                            name: 'cow',
                            content: {
                                hello: 'world'
                            }
                        }
                    ]
                },
                {
                    path: subdivision.systemPaths.commands,
                    addins: [
                        {
                            type: 'subdivision.command',
                            name: 'cow',
                            execute: function () {
                            }
                        }
                    ]
                }
            ]
        });

        subdivision.buildServices = null;
        subdivision.start().then(function () {
            expect(subdivision.vent.trigger.calledWith('before:buildServices')).to.be.false;
            expect(subdivision.vent.trigger.calledWith('after:buildServices')).to.be.false;
            var service = subdivision.getService('cow');
            expect(service).to.be.undefined;
            done();
        }).catch(function (error) {
            done(error);
        });
        subdivision.buildServices = temp;

    });
});