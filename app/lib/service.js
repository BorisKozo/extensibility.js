(function (subdivision) {
    'use strict';
    var services;

    function initializeServiceRecursive(service) {
        if (service) {
            return initializeServiceRecursive(service.$next).then(function () {
                var result;
                if (service.hasOwnProperty('initialize') && _.isFunction(service.initialize)) {
                    result = service.initialize();
                }
                return Promise.resolve(result);
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
        service.$name = name;
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
        var builtServices = subdivision.build(subdivision.systemPaths.services); //TODO: This assumes that there is a builder side effect that adds the services to the services map
        var initializedServices = new Set();
        return _.reduce(builtServices, function (promise, service) {
            if (initializedServices.has(service.$name)) {
                return promise;
            }
            initializedServices.add(service.$name);
            subdivision.vent.trigger('before:service:initialized', service.$name);
            return promise.then(function () {
                return initializeServiceRecursive(subdivision.getService(service.$name)).then(function () {
                    subdivision.vent.trigger('after:service:initialized', service.$name, subdivision.getService(service.$name));
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