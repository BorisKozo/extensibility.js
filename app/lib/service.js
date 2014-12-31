(function (EJS) {
    'use strict';
    var count = 0;
    var services = {};

    EJS.Service = function (options) {
        var result = _.assign({
            vent: _.extend({}, EJS.Events)
        }, options);
        return result;
    };

    EJS.systemServicesPath = EJS.registry.joinPath(EJS.systemPathPrefix, 'services');

    EJS.addBuilder({
        type: 'EJS.service',
        id: 'EJS.serviceBuilder',
        order: 100,
        build: function (addin) {

        }
    });

    /**
     * Returns the service instance by the given name or null if no service by that name can be found or instantiated
     * @param name - The name of the service to retrieve
     */
    EJS.getService = function (name) {
        if (services[name] === undefined) {
            return null;
        }

        return services[name];
    };

    /**
     * Builds and initializes all the registered services
     * @param callback
     */
    EJS.buildServices = function(){
       var services = EJS.build(EJS.systemServicesPath);

    }

})(EJS);