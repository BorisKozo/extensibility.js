(function (EJS) {
    'use strict';
    var count = 0;
    var commands = {};

    function trueFunction() {
        return true;
    }


    EJS.Command = function (options) {
        options = options || {};
        var result = EJS.Addin.$internalConstructor('command', count++, options);
        result.name = options.name || result.id;
        if (!_.isFunction(result.execute)) {
            throw new Error('Command options must contain the "execute" function ' + JSON.stringify(options));
        }
        if (!_.isFunction(result.isValid)) {
            result.isValid = trueFunction;
        }
        if (!result.hasOwnProperty('canExecute')) {
            result.canExecute = EJS.Command.$canExecute;
        }

        return result;
    };

    EJS.Command.$canExecute = function(){
        var condition = this.condition;
        if (_.isString(condition)) {
            condition = EJS.getCondition(condition);
        }
        //If a condition was defined then the condition isValid function
        // AND
        //If isValid was defined then the value of the isValid function
        return (!Boolean(condition) || condition.isValid()) && (!_.isFunction(this.isValid) || this.isValid());
    };


    EJS.systemPaths.commands = EJS.registry.joinPath(EJS.systemPaths.prefix, 'commands');

    EJS.defaultManifest.paths.push({
        path: EJS.systemPaths.builders,
        addins: [{
            target: 'EJS.command',
            id: 'EJS.commandBuilder',
            order: 100,
            build: function (addin) {
                var condition = new EJS.Command(addin);
                return condition;
            }
        }]
    });

    EJS.getCommand = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        return commands[name];
    };

    EJS.addCommand = function (options, force) {
        var command = new EJS.Command(options);

        var name = command.name;

        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (commands[name] && !force) {
            return false;
        }

        EJS.removeCommand(name);

        commands[name] = command;
        if (_.isFunction(command.initialize)) {
            command.initialize();
        }
        return true;
    };

    EJS.removeCommand = function (name) {
        if (name === undefined || name === null) {
            throw new Error('name must not be undefined or null');
        }
        if (commands[name] && _.isFunction(commands[name].destroy)) {
            commands[name].destroy();
        }
        commands[name] = undefined;
    };

    EJS.$clearCommands = function () {
        commands = {};
    };
})
(EJS);