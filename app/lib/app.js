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

    function buildCommandsInternal() {
        var commands = subdivision.build(subdivision.systemPaths.commands);
        _.forEach(commands, function (command) {
            subdivision.addCommand(command, true);
        });
    }

    function buildConditionsInternal() {
        var conditions = subdivision.build(subdivision.systemPaths.conditions);
        _.forEach(conditions, function (condition) {
            subdivision.addCondition(condition, true);
        });
    }

    subdivision.start = function () {

        subdivision.vent.trigger('before:start');
        if (subdivision.defaultManifest) {
            subdivision.vent.trigger('before:readDefaultManifest');
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.vent.trigger('after:readDefaultManifest');
        }

        subdivision.$generateBuilders();

        subdivision.vent.trigger('before:buildConditions');
        buildConditionsInternal();
        subdivision.vent.trigger('after:buildConditions');

        subdivision.vent.trigger('before:buildCommands');
        buildCommandsInternal();
        subdivision.vent.trigger('after:buildCommands');

        //This will be a generic initializer
        return buildServicesInternal().then(function () {
            subdivision.vent.trigger('after:start');
        });
    };
})(subdivision);