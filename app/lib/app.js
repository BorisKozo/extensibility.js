(function (subdivision) {
    'use strict';
    subdivision.systemPaths = {
        prefix: 'subdivision'
    };

    subdivision.vent = subdivision.createEventBus();

    function buildServicesInternal() {
        if (_.isFunction(subdivision.buildServices)) {
            subdivision.vent.trigger('before:buildServices');
            return subdivision.buildServices().then(function () {
                subdivision.vent.trigger('after:buildServices');
            });
        } else {
            return Promise.resolve();
        }
    }

    subdivision.start = function () {

        if (subdivision.defaultManifest) {
            subdivision.vent.trigger('before:readDefaultManifest');
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.vent.trigger('after:readDefaultManifest');
        }

        subdivision.generateBuilders();

        return buildServicesInternal();
    };
})(subdivision);