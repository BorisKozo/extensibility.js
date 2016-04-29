(function (subdivision) {
    'use strict';
    var count = 0;
    var conditions = {};

    subdivision.Condition = function (options) {
        options = options || {};
        var result = subdivision.Addin.$internalConstructor('condition', count++, options);
        result.name = options.name || result.id;
        if (_.isString(result.isValid)) { //In this case we need to build the actual isValid function from the boolean parser
            var expression = result.isValid;
            result.isValid = function () {
                var booleanParser = new subdivision.utils.BooleanPhraseParser();
                var context = subdivision.Condition.$buildContext();  //we need to build the context each time in case someone changed the literals
                var parsedCondition = booleanParser.evaluate(expression, context);
                return parsedCondition.isValid();
            };
        }
        if (!_.isFunction(result.isValid)) {
            throw new Error('A condition must have an isValid function ' + result.id);
        }
        return result;
    };

    subdivision.Condition.$buildContext = function () {
        var notConditionOperator = subdivision.build(subdivision.systemPaths.conditionOperations,null, {literal: '!'})[0];
        var andConditionOperator = subdivision.build(subdivision.systemPaths.conditionOperations,null, {literal: '&'})[0];
        var orConditionOperator = subdivision.build(subdivision.systemPaths.conditionOperations,null, {literal: '|'})[0];
        if (notConditionOperator && andConditionOperator && orConditionOperator) {
            return {
                not: notConditionOperator.generator,
                and: andConditionOperator.generator,
                or: orConditionOperator.generator,
                literal: function (conditionName) {
                    return subdivision.getCondition(conditionName);
                }
            };
        } else {
            throw new Error('Condition operators for "not", "and", "or" must exist');
        }
    };

    subdivision.systemPaths.conditions = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'conditions');

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [{
            target: 'subdivision.condition',
            id: 'subdivision.conditionBuilder',
            order: 100,
            build: function (addin) {
                var condition = new subdivision.Condition(addin);
                return condition;
            }
        }]
    });

    subdivision.getCondition = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        return conditions[name];
    };

    subdivision.addCondition = function (options, force) {
        var condition = new subdivision.Condition(options);

        var name = condition.name;

        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (conditions[name] && !force) {
            return false;
        }

        subdivision.removeCondition(name);

        conditions[name] = condition;
        if (_.isFunction(condition.initialize)) {
            condition.initialize();
        }
        return true;
    };

    subdivision.removeCondition = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (conditions[name] && _.isFunction(conditions[name].destroy)) {
            conditions[name].destroy();
        }
        conditions[name] = undefined;
    };

    subdivision.$clearConditions = function () {
        conditions = {};
    };

    subdivision.systemPaths.conditionOperations = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'conditionOperations');

    subdivision.Condition.$conditionOperationBuilder = {
        target: 'subdivision.conditionOperation',
        id: 'subdivision.conditionOperationBuilder',
        order: 100,
        build: function (addin) {
            return {
                literal: addin.literal,
                generator: addin.generator
            };
        }
    };

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [subdivision.Condition.$conditionOperationBuilder]
    });

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.conditionOperations,
        addins: [
            {
                id: 'NotConditionOperation',
                literal: '!',
                type: 'subdivision.conditionOperation',
                generator: function (element) {
                    return {
                        isValid: function () {
                            if (_.isFunction(element.isValid)) {
                                return !Boolean(element.isValid());
                            } else {
                                throw new Error('Cannot evaluate "!" operation because the target has no isValid function ' + JSON.stringify(element));
                            }
                        }
                    };
                }
            },
            {
                id: 'OrConditionOperation',
                literal: '|',
                type: 'subdivision.conditionOperation',
                generator: function (leftElement, rightElement) {
                    return {
                        isValid: function () {
                            if (!_.isFunction(leftElement.isValid)) {
                                throw new Error('Cannot evaluate "|" operation because the first target has no isValid function ' + JSON.stringify(leftElement));
                            }
                            if (!_.isFunction(rightElement.isValid)) {
                                throw new Error('Cannot evaluate "|" operation because the second target has no isValid function ' + JSON.stringify(rightElement));
                            }

                            return Boolean(leftElement.isValid()) || Boolean(rightElement.isValid());
                        }
                    };
                }
            },
            {
                id: 'AndConditionOperation',
                literal: '&',
                type: 'subdivision.conditionOperation',
                generator: function (leftElement, rightElement) {
                    return {
                        isValid: function () {
                            if (!_.isFunction(leftElement.isValid)) {
                                throw new Error('Cannot evaluate "&" operation because the first target has no isValid function ' + JSON.stringify(leftElement));
                            }
                            if (!_.isFunction(rightElement.isValid)) {
                                throw new Error('Cannot evaluate "&" operation because the second target has no isValid function ' + JSON.stringify(rightElement));
                            }

                            return Boolean(leftElement.isValid()) && Boolean(rightElement.isValid());
                        }
                    };
                }
            }
        ]
    });
})(subdivision);
