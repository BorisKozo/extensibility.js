describe('Manifest Reader', function () {
    'use strict';
    var expect = require('chai').expect;
    var subdivision = require('./../../../dist/subdivision.node.js');

    it('should have the readDirectory function', function () {
        expect(subdivision).to.have.ownProperty('readDirectory');
    });
});