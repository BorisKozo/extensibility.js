describe('Value', function () {
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
        subdivision.$clearValues();
    });

    describe('addValue', function () {
        it('should add a value', function () {
            subdivision.addValue('moo', {b: 'bb'});
            var value = subdivision.getValue('moo');
            expect(value).to.be.ok;
            expect(value.b).to.be.equal('bb');
        });

        it('should add a value with override', function () {
            subdivision.addValue('moo', {b: 'bb'});
            subdivision.addValue('moo', {c: 'cc'}, true);
            var value = subdivision.getValue('moo');
            expect(value).to.be.ok;
            expect(value.b).to.be.undefined;
            expect(value.c).to.be.equal('cc');
        });

        it('should throw an error if the name was not specified', function () {
            expect(function () {
                subdivision.addValue();
            }).to.throw('Value name must be defined');
        });

        it('should throw an error if two values of the same name are defined', function () {
            expect(function () {
                subdivision.addValue('a',1);
                subdivision.addValue('a',2);
            }).to.throw('A value with the name a already exists');
        });
    });

    describe('getValue', function () {
        it('should get a value', function () {
            var obj = {};
            subdivision.addValue('monkey', obj);
            var value = subdivision.getValue('monkey');
            expect(value).to.be.equal(obj);
        });

        it('should not get a value if it was undefined', function () {
            var value = subdivision.getValue('monkey');
            expect(value).to.be.undefined;
        });
    });

    describe('buildValues', function () {
        beforeEach(function () {
            sinon.spy(subdivision.vent, 'trigger');
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.$generateBuilders();
        });

        afterEach(function () {
            subdivision.vent.trigger.restore();
        });

        it('should build the values path', function () {

            subdivision.readManifest({
                paths: [
                    {
                        path: subdivision.systemPaths.values,
                        addins: [
                            {
                                id: 'value1',
                                name: 'monkey',
                                type: 'subdivision.value',
                                order: 1,
                                value: {
                                    a: 'aa'
                                }
                            },
                            {
                                id: 'value2',
                                name: 'monkey',
                                type: 'subdivision.value',
                                order: '>value1',
                                value: {
                                    b: 'bb'
                                }
                            }
                        ]
                    }
                ]
            });


            subdivision.buildValues();
            var value = subdivision.getValue('monkey');
            expect(value).to.be.ok;
            expect(value.a).to.be.undefined;
            expect(value.b).to.be.equal('bb');
            expect(subdivision.vent.trigger.calledWith('before:values:built')).to.be.true;
            expect(subdivision.vent.trigger.calledWith('after:values:built')).to.be.true;
        });
    });

    describe('value builder', function () {
        beforeEach(function () {
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.$generateBuilders();
        });

        it('should throw an error if name was not defined', function () {
            subdivision.readManifest({
                paths: [
                    {
                        path: subdivision.systemPaths.values,
                        addins: [
                            {
                                id: 'value1',
                                type: 'subdivision.value',
                                order: 1,
                                value: {
                                    a: 'aa'
                                }
                            }]
                    }]
            });

            expect(function () {
                subdivision.build(subdivision.systemPaths.values);
            }).to.throw('Value name must be defined');
        });

        it('should throw an error if value was not defined', function () {
            subdivision.readManifest({
                paths: [
                    {
                        path: subdivision.systemPaths.values,
                        addins: [
                            {
                                id: 'value1',
                                type: 'subdivision.value',
                                order: 1,
                                name: 'value1'
                            }]
                    }]
            });

            expect(function () {
                subdivision.build(subdivision.systemPaths.values);
            }).to.throw('Value must have a value property');
        });
    });

    describe('values object', function () {
       it('should contain a value', function () {
         var obj = '12345';
           subdivision.addValue('foo',obj);
           expect(subdivision.values.foo).to.be.equal('12345');
       });
    });
});