(function (EJS) {
    'use strict';
    var count = 0;
    var conditions = {};

    EJS.Condition = function (options) {
        options = _.isFunction(options) ? options() : options || {};
        var result = _.assign({}, options);
        result.id = result.id ? String(result.id) : ('condition' + count++);
        result.name = options.name || result.id;
        result.order = result.order || 0;
        if (!_.isFunction(result.isValid)) {
            throw  new Error('A condition must have an isValid function + ' + result.id);
        }

        return result;
    };

    EJS.systemPaths.conditions = EJS.registry.joinPath(EJS.systemPaths.prefix, 'conditions');

    EJS.defaultManifest.paths.push({
        path: EJS.systemPaths.builders,
        addins: [{
            type: 'EJS.condition',
            id: 'EJS.conditionBuilder',
            order: 100,
            build: function (addin) {
                var condition = new EJS.Condition(addin);
                EJS.addCondition(condition);
            }
        }]
    });

    EJS.getCondition = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        return conditions[name];
    };

    EJS.addCondition = function (condition, force) {
        if (conditions[condition.name] && !force) {
            throw new Error('A condition with the name ' + condition.name + ' already exists')
        }
        conditions[name] = condition;
        if (_.isFunction(condition.initialize)) {
            condition.initialize();
        }
    };

    EJS.removeCondition = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (_.isFunction(conditions[name].destory)) {
            conditions[name].destroy();
        }
        conditions[name] = undefined;
    };

    EJS.$clearConditions = function () {
        conditions = {};
    };

    EJS.systemPaths.conditionOperations = EJS.registry.joinPath(EJS.systemPaths.prefix, 'conditionOperations');

    EJS.addBuilder({
        type: 'EJS.conditionOperation',
        id: 'EJS.conditionOperationBuilder',
        order: 100,
        build: function (addin) {
            return {
                literal: addin.literal,
                generator: addin.generator
            }
        }
    });

    EJS.defaultManifest.paths.push({
        path: EJS.systemPaths.conditionOperations,
        addins: [
            {
                id: 'NotConditionOperation',
                literal: '!',
                type: 'EJS.conditionOperation',
                generator: function (element) {
                    return {
                        isValid: function () {
                            if (_.isFunction(element.isValid)) {
                                return !Boolean(element.isValid());
                            } else {
                                throw new Error('Cannot evaluate "!" operation because the target has no isValid function ' + JSON.stringify(element))
                            }
                        }
                    };
                }
            },
            {
                id: 'OrConditionOperation',
                literal: '|',
                type: 'EJS.conditionOperation',
                generator: function (leftElement, rightElement) {
                    return {
                        isValid: function () {
                            if (!_.isFunction(leftElement.isValid)) {
                                throw new Error('Cannot evaluate "|" operation because the first target has no isValid function ' + JSON.stringify(leftElement))
                            }
                            if (!_.isFunction(rightElement.isValid)) {
                                throw new Error('Cannot evaluate "|" operation because the second target has no isValid function ' + JSON.stringify(rightElement))
                            }

                            return Boolean(leftElement.isValid()) || Boolean(rightElement.isValid());
                        }
                    };
                }
            },
            {
                id: 'AndConditionOperation',
                literal: '&',
                type: 'EJS.conditionOperation',
                generator: function (leftElement, rightElement) {
                    return {
                        isValid: function () {
                            if (!_.isFunction(leftElement.isValid)) {
                                throw new Error('Cannot evaluate "&" operation because the first target has no isValid function ' + JSON.stringify(leftElement))
                            }
                            if (!_.isFunction(rightElement.isValid)) {
                                throw new Error('Cannot evaluate "&" operation because the second target has no isValid function ' + JSON.stringify(rightElement))
                            }

                            return Boolean(leftElement.isValid()) && Boolean(rightElement.isValid());
                        }
                    };
                }
            }
        ]
    })


})(EJS);
