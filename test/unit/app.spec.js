describe('Addin', function () {
    'use strict';
    var expect = chai.expect;
    var EJS = window.EJS;

    beforeEach(function () {
        sinon.spy(EJS.vent, 'trigger');
    });

    afterEach(function () {
        EJS.vent.trigger.restore();
    });

    it('should start EJS', function (done) {
        EJS.readManifest({
            paths: [
                {
                    path: EJS.systemServicesPath,
                    addins: [
                        {
                            type: 'EJS.service',
                            name: 'cow',
                            content: {
                                hello: 'world'
                            }
                        }
                    ]
                }
            ]
        });


        EJS.start().then(function () {
            expect(EJS.vent.trigger.calledWith('before:buildServices')).to.be.true;
            expect(EJS.vent.trigger.calledWith('after:buildServices')).to.be.true;
            var service = EJS.getService('cow');
            expect(service).to.be.ok;
            expect(service.hello).to.be.equal('world');
            done();
        }, function(error){
            done(error);
        });

    });
});