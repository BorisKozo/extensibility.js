(function (subdivision) {
    'use strict';
    var count = 0;
    var commands = {};



    subdivision.Command = function (options) {
        options = options || {};
        var result = subdivision.Addin.$internalConstructor('command', count++, options);
        result.name = options.name || result.id;
        if (!_.isFunction(result.execute)) {
            throw new Error('Command options must contain the "execute" function ' + JSON.stringify(options));
        }
        if (!result.hasOwnProperty('isValid')) {
            result.isValid = true;
        }
        if (!result.hasOwnProperty('canExecute')) {
            result.canExecute = subdivision.Command.$canExecute;
        }

        return result;
    };

    subdivision.Command.$canExecute = function () {
        var conditionResult = true;
        var condition;
        if (this.hasOwnProperty('condition')) {
            condition = this.condition;
            if (_.isString(condition)) {
                condition = subdivision.getCondition(condition);
                if (condition === undefined) { //generate condition from isValid parser
                    condition = new subdivision.Condition({
                        isValid: this.condition
                    });
                }
            }
            conditionResult = condition.isValid(this);
        }


        var validity = true;
        if (this.hasOwnProperty('isValid')) {
            if (_.isFunction(this.isValid)) {
                validity = this.isValid();
            } else {
                validity = Boolean(this.isValid);
            }
        }

        return conditionResult && validity;
    };

    subdivision.systemPaths.commands = subdivision.registry.joinPath(subdivision.systemPaths.prefix, 'commands');

    subdivision.defaultManifest.paths.push({
        path: subdivision.systemPaths.builders,
        addins: [{
            target: 'subdivision.command',
            id: 'subdivision.commandBuilder',
            order: subdivision.registry.$defaultOrder,
            build: function (addin) {
                return new subdivision.Command(addin);
            }
        }]
    });

    subdivision.getCommand = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        return commands[name];
    };

    subdivision.addCommand = function (options, force) {
        var command = new subdivision.Command(options);

        var name = command.name;

        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (commands[name] && !force) {
            return false;
        }

        subdivision.removeCommand(name);

        commands[name] = command;
        if (_.isFunction(command.initialize)) {
            command.initialize();
        }
        return true;
    };

    subdivision.removeCommand = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (commands[name] && _.isFunction(commands[name].destroy)) {
            commands[name].destroy();
        }
        commands[name] = undefined;
    };

    subdivision.$clearCommands = function () {
        commands = {};
    };
})(subdivision);