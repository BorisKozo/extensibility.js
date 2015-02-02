(function (EJS) {
    'use strict';
    EJS.systemPaths = {
        prefix: 'EJS'
    };

    EJS.vent = EJS.createEventBus();

    function buildServicesInternal() {
        if (_.isFunction(EJS.buildServices)) {
            EJS.vent.trigger('before:buildServices');
            return EJS.buildServices().then(function () {
                EJS.vent.trigger('after:buildServices');
            });
        } else {
            return Promise.resolve();
        }
    }

    EJS.start = function () {

        if (EJS.defaultManifest) {
            EJS.vent.trigger('before:readDefaultManifest');
            EJS.readManifest(EJS.defaultManifest);
            EJS.vent.trigger('after:readDefaultManifest');
        }

        return buildServicesInternal();
    };
})(EJS);