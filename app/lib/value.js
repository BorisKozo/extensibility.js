(function (subdivision) {
    'use strict';
    var values;

    subdivision.systemPaths.values = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'values');

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [{
            target: 'subdivision.value',
            id: 'subdivision.valueBuilder',
            order: subdivision.registry.$defaultOrder,
            build: function (addin) {
                if (_.isNil(addin.name)){
                    throw new Error('Value name must be defined '+JSON.stringify(addin));
                }
                if (!addin.hasOwnProperty('value')){
                    throw new Error('Value must have a value property '+JSON.stringify(addin));
                }
                subdivision.addValue(addin.name, addin.value, true);
            }
        }]
    });

    subdivision.getValue = function (name) {
        return values[name];
    };

    subdivision.addValue = function (name, value, override) {
        if (_.isNil(name)){
            throw new Error('Value name must be defined');
        }
        if (override || !values.hasOwnProperty(name)) {
            values[name] = value;
        } else {
            throw new Error('A value with the name ' + name + ' already exists');
        }
    };

    subdivision.$clearValues = function () {
        values = {};
    };

    /**
     * Builds and initializes all the registered values
     */
    subdivision.buildValues = function () {
        subdivision.vent.trigger('before:values:built');
        subdivision.$clearValues();
        subdivision.build(subdivision.systemPaths.values);
        subdivision.vent.trigger('after:values:built');
    };

    Object.defineProperty(subdivision, 'values', {
        enumerable: true,
        configurable: false,
        get: function () {
            return _.clone(values);
        }
    });

})(subdivision);