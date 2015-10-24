describe('Addin', function () {
    'use strict';
    var expect = chai.expect;
    var subdivision = window.subdivision;

    beforeEach(function () {
        sinon.spy(subdivision.vent, 'trigger');
    });

    afterEach(function () {
        subdivision.vent.trigger.restore();
    });

    it('should start subdivision', function (done) {
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
        }, function(error){
            done(error);
        });

    });
});