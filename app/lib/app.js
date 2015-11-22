(function (subdivision) {
    'use strict';
    subdivision.systemPaths = {
        prefix: 'subdivision'
    };

    subdivision.vent = subdivision.createEventBus();

    //This will move to service file
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

    //This will move to commands file
    function buildCommandsInternal() {
        var commands = subdivision.build(subdivision.systemPaths.commands);
        _.forEach(commands, function (command) {
            subdivision.addCommand(command, true);
        });
    }

    subdivision.start = function () {

        if (subdivision.defaultManifest) {
            subdivision.vent.trigger('before:readDefaultManifest');
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.vent.trigger('after:readDefaultManifest');
        }

        subdivision.$generateBuilders();

        //This will be a generic initializer
        return buildServicesInternal().then(function () {
            buildCommandsInternal();
        });
    };
})(subdivision);