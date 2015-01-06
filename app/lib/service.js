(function (EJS) {
    'use strict';
    var services = {};

    function initializeServiceRecursive(service) {
        if (service) {
            return initializeServiceRecursive(service.$next).then(function () {
                if (service.hasOwnProperty('initialize') && _.isFunction(service.initialize)) {
                    return service.initialize();
                } else {
                    return Promise.resolve();
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    EJS.Service = function (options, prototype) {
        var result = Object.create(prototype || {});
        if (_.isFunction(options)) {
            options = options();
        }
        options = options || {};
        result = _.assign(result, {
            $vent: EJS.createEventBus(),
            $next: prototype ? prototype : undefined
        }, options);
        return result;
    };

    EJS.Service.builder = {
        type: 'EJS.service',
        id: 'EJS.serviceBuilder',
        order: 100,
        build: function (addin) {
            if (_.isString(addin.name) && !_.isEmpty(addin.name)) {
                EJS.addService(addin.name, addin.content, addin.override);
            } else {
                throw new Error('Service name must be defined ' + JSON.stringify(addin));
            }
        }
    };

    EJS.systemServicesPath = EJS.registry.joinPath(EJS.systemPathPrefix, 'services');

    EJS.addBuilder(EJS.Service.builder);

    /**
     * Returns the service instance by the given name or null if no service by that name can be found or instantiated
     * @param name - The name of the service to retrieve
     */
    EJS.getService = function (name) {
        return services[name];
    };

    EJS.addService = function (name, options, override) {
        name = String(name).trim();
        var nextService;
        if (!override) {
            nextService = EJS.getService(name);
        }
        var service = new EJS.Service(options, nextService);
        services[name] = service;
        return service;
    };

    EJS.clearServices = function () {
        services = {};
    };

    /**
     * Builds and initializes all the registered services
     * Returns a promise which is resolved when all the services are initialized or rejected if one of the services has failed to initialize
     */
    EJS.buildServices = function () {
        EJS.build(EJS.systemServicesPath);
        var promises = [];
        _.forEach(_.keys(services), function (name) {
            EJS.vent.trigger('before:service:initialized', name);
            promises.push(initializeServiceRecursive(EJS.getService(name)).then(function () {
                EJS.vent.trigger('after:service:initialized', name, EJS.getService(name));
            }));
        });
        return Promise.all(promises);
    }

})(EJS);