(function (subdivision) {
    'use strict';
    var services;

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

    subdivision.Service = function (options, prototype) {
        var result = Object.create(prototype || {});
        if (_.isFunction(options)) {
            options = options();
        }
        options = options || {};
        result = _.assign(result, {
            $vent: subdivision.createEventBus(),
            $next: prototype ? prototype : undefined
        }, options);
        return result;
    };

    subdivision.systemPaths.services = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'services');

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [{
            target: 'subdivision.service',
            id: 'subdivision.serviceBuilder',
            order: subdivision.registry.$defaultOrder,
            build: function (addin) {
                if (_.isString(addin.name) && !_.isEmpty(addin.name)) {
                    return subdivision.addService(addin.name, addin.content, addin.override);
                } else {
                    throw new Error('Service name must be defined ' + JSON.stringify(addin));
                }
            }
        }]
    });


    /**
     * Returns the service instance by the given name or null if no service by that name can be found or instantiated
     * @param name - The name of the service to retrieve
     */
    subdivision.getService = function (name) {
        return services[name];
    };

    subdivision.addService = function (name, options, override) {
        name = String(name).trim();
        var nextService;
        if (!override) {
            nextService = subdivision.getService(name);
        }
        var service = new subdivision.Service(options, nextService);
        services[name] = service;
        return service;
    };

    subdivision.$clearServices = function () {
        services = {};
    };

    /**
     * Builds and initializes all the registered services
     * Returns a promise which is resolved when all the services are initialized or rejected if one of the services has failed to initialize
     */
    subdivision.buildServices = function () {
        subdivision.$clearServices();
        var services = subdivision.build(subdivision.systemPaths.services); //TODO: This assumes that there is a builder side effect that adds the services to the services map
        return _.reduce(services, function (promise, name) {
            subdivision.vent.trigger('before:service:initialized', name);
            return promise.then(function () {
                return initializeServiceRecursive(subdivision.getService(name)).then(function () {
                    subdivision.vent.trigger('after:service:initialized', name, subdivision.getService(name));
                });
            });
        }, Promise.resolve());
    };

    Object.defineProperty(subdivision, 'services', {
        enumerable: true,
        configurable: false,
        get: function () {
            return _.clone(services);
        }
    });

})(subdivision);