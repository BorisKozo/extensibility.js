describe('Manifest Reader', function () {
    'use strict';
    var expect = require('chai').expect;
    var sinon = require('sinon');
    var proxyquire = require('proxyquire').noCallThru();

    var resetSymbol = Symbol.for('global.subdivision.singleton.reset');
    global[resetSymbol] = true;

    var glob = function (pattern, options, callback) {
        if (pattern === 'error') {
            callback('error');
        } else {
            callback(null, ['foo.js', 'bar.js']);
        }

    };
    glob.sync = function () {
        return ['foo.js', 'bar.js'];
    };

    var subdivision = proxyquire('./../../../dist/subdivision.node.js', {
        'glob': glob,
        'foo.js': 'foofoo',
        'bar.js': 'barbar'
    });

    beforeEach(function () {
        subdivision.readManifest = sinon.stub();
    });


    it('should read some files asynchronously', function (done) {
        subdivision.readManifestFiles.async('foo').then(function () {
            expect(subdivision.readManifest.calledTwice).to.be.true;
            expect(subdivision.readManifest.getCall(0).args[0]).to.be.equal('foofoo');
            expect(subdivision.readManifest.getCall(1).args[0]).to.be.equal('barbar');
            done();
        });
    });

    it('should read some files synchronously', function () {
        subdivision.readManifestFiles('foo');
        expect(subdivision.readManifest.calledTwice).to.be.true;
        expect(subdivision.readManifest.getCall(0).args[0]).to.be.equal('foofoo');
        expect(subdivision.readManifest.getCall(1).args[0]).to.be.equal('barbar');
    });

    it('should fail on error', function (done) {
        subdivision.readManifestFiles.async('error').catch(function (err) {
            expect(err).to.be.equal('error');
            done();
        });
    });
});