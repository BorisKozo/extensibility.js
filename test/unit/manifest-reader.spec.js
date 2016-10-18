describe('Manifest Reader', function () {
    'use strict';
    var expect;
    var subdivision;
    var sinon;
    var _;
    if (typeof window === 'undefined') {
        expect = require('chai').expect;
        sinon = require('sinon');
        subdivision = require('./../../dist/subdivision.node.js');
        _ = require('lodash');
    } else {
        expect = chai.expect;
        subdivision = window.subdivision;
        sinon = window.sinon;
        _ = window._;
    }

    beforeEach(function () {
        subdivision.registry.$clear();
        subdivision.$clearBuilders();
    });

    it('should not read disabled path', function () {
        subdivision.addBuilder({
            target: null,
            build: function (addin) {
                return addin.id;
            }
        });
        subdivision.readManifest({
            paths: [
                {
                    path: 'a',
                    isEnabled: true,
                    addins: [
                        {
                            id: '1'
                        }
                    ]
                },
                {
                    path: 'b',
                    isEnabled: false,
                    addins: [
                        {
                            id: '2'
                        }
                    ]
                },
                {
                    path: 'c',
                    isEnabled: function () {
                        return true;
                    },
                    addins: [
                        {
                            id: '3'
                        }
                    ]
                },
                {
                    path: 'd',
                    isEnabled: function () {
                        return false;
                    },
                    addins: [
                        {
                            id: '4'
                        }
                    ]
                }
            ]
        });

        expect(subdivision.build('a').length).to.be.equal(1);
        expect(subdivision.build('b').length).to.be.equal(0);
        expect(subdivision.build('c').length).to.be.equal(1);
        expect(subdivision.build('d').length).to.be.equal(0);

    });


    it('should auto assign order if it was defined on the path level', function () {
        subdivision.addBuilder({
            target: null,
            build: function (addin) {
                return addin;
            }
        });
        subdivision.readManifest({
            paths: [
                {
                    path: 'a',
                    order:1000,
                    addins: [
                        {
                            id: '1'
                        },
                        {
                            id: '2'
                        },
                        {
                            id: '3',
                            order: 1
                        }

                    ]
                }
            ]
        });

        var addins = subdivision.build('a');
        expect(addins.length).to.be.equal(3);
        expect(addins[0].id).to.be.equal('3');
        expect(addins[1].id).to.be.equal('1');
        expect(addins[2].id).to.be.equal('2');
        expect(addins[1].order).to.be.equal(1000);
        expect(addins[2].order).to.be.equal(1100);
    });
});