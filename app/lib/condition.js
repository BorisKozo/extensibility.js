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

    EJS.Condition.builder = {
        type: 'EJS.condition',
        id: 'EJS.conditionBuilder',
        order: 100,
        build: function (addin) {
            var condition = new EJS.Condition(addin);
            EJS.addCondition(condition);
        }
    };

    EJS.systemConditionsPath = EJS.registry.joinPath(EJS.systemPathPrefix, 'conditions');

    EJS.addBuilder(EJS.Condition.builder);

    EJS.getCondition = function (name){
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

    EJS.$clearConditions = function(){
        conditions = {};
    };

    EJS.addBuilder({
        type:'EJS.conditionOperation',
        id:'EJS.conditionOperationBuilder',
        order:100,
        build: function(addin){

        }
    })



})(EJS);
