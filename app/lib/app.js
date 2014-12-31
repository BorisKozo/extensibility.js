(function (EJS) {
    'use strict';
    EJS.systemPathPrefix = 'EJS';
    EJS.vent = _.assign({}, EJS.Events);

    function callIfFunction(callback){
        if (_.isFunction(callback)) {
            callback();
        }
    }

    function buildServicesInternal(){
        if (_.isFunction(EJS.buildServices)) {
            EJS.vent.trigger('before:buildServices');
            EJS.buildServices(function(){
                EJS.vent.trigger('after:buildServices');
                callIfFunction(callback);
            });
        } else {
            return 
        }

    }

    EJS.start = function () {
        //Add the builders builder to allow builders to be defined in paths
        EJS.addBuilder({
            type: 'EJS.builder',
            id: 'EJS.builder',
            build: function (addin) {
                EJS.addBuilder(addin);
            }
        });

        if (EJS.defaultManifest) {
            EJS.vent.trigger('before:readDefaultManifest');
            EJS.readManifest(EJS.defaultManifest);
            EJS.vent.trigger('after:readDefaultManifest');
        }

        return buildServicesInternal();
    }
})(EJS);