describe('Command', function () {
    'use strict';
    var expect;
    var subdivision;
    var sinon;
    if (typeof window === 'undefined') {
        expect = require('chai').expect;
        sinon = require('sinon');
        subdivision = require('./../../dist/subdivision.node.js');
    } else {
        expect = chai.expect;
        subdivision = window.subdivision;
        sinon = window.sinon;
    }

    beforeEach(function () {
        subdivision.registry.$clear();
        subdivision.$clearBuilders();
        subdivision.$clearCommands();
        subdivision.$clearConditions();
    });

    describe('Create a command', function () {
        it('should create a command', function () {
            var command = new subdivision.Command({
                id: 'aa',
                name: 'bb',
                execute: function () {
                }
            });
            expect(command).to.be.ok;
            expect(command.id).to.be.equal('aa');
            expect(command.name).to.be.equal('bb');

            command = new subdivision.Command({
                execute: function () {
                }
            });

            expect(command.id).to.be.ok;
            expect(command.name).to.be.equal(command.id);
        });

        it('should throw if a command is created without execute function', function () {
            expect(function () {
                var condition = new subdivision.Command({});
            }).to.throw('Command options must contain the "execute" function');
        });

        it('should provide a default truthy isValid function if it was not defined', function () {
            var command = new subdivision.Command({
                id: 'aa',
                name: 'bb',
                execute: function () {
                }
            });
            expect(command).to.be.ok;
            expect(command.isValid).to.be.ok;
            expect(command.isValid()).to.be.true;
        });

        describe('canExecute', function () {
            it('should use user defined canExecute', function () {
                var canExecute = function () {
                };
                var command = new subdivision.Command({
                    execute: function () {
                    },
                    canExecute: canExecute
                });

                expect(command.canExecute).to.be.equal(canExecute);
            });

            it('should use the value of the condition if such is provided', function () {
                var isValidResult = true;
                subdivision.addCondition({
                    name: 'hello',
                    isValid: function () {
                        return isValidResult;
                    }
                });

                var command = new subdivision.Command({
                    condition: 'hello',
                    execute: function () {
                    }
                });

                expect(command.canExecute()).to.be.equal(isValidResult);
                isValidResult = false;
                expect(command.canExecute()).to.be.equal(isValidResult);
                isValidResult = true;

                command = new subdivision.Command({
                    condition: new subdivision.Condition({
                        isValid: function () {
                            return isValidResult;
                        }
                    }),
                    execute: function () {
                    }
                });
                expect(command.canExecute()).to.be.equal(isValidResult);
                isValidResult = false;
                expect(command.canExecute()).to.be.equal(isValidResult);
                isValidResult = true;
            });

            it('should use the value of isValid function if such is provided', function () {
                var isValidResult = true;
                var command = new subdivision.Command({
                    isValid: function () {
                        return isValidResult;
                    },
                    execute: function () {
                    }
                });
                expect(command.canExecute()).to.be.equal(isValidResult);
                isValidResult = false;
                expect(command.canExecute()).to.be.equal(isValidResult);
                isValidResult = true;

            });
        });
    });

    describe('Command builder', function () {
        it('should build a command', function () {
            subdivision.readManifest(subdivision.defaultManifest);

            subdivision.readManifest({
                paths: [
                    {
                        path: subdivision.systemPaths.commands,
                        addins: [
                            {
                                id: 'command1',
                                name: 'monkey',
                                type: 'subdivision.command',
                                order: 1,
                                execute: function () {
                                    return true;
                                },
                                condition: 'myCondition'
                            }
                        ]
                    }
                ]
            });
            subdivision.$generateBuilders();

            subdivision.addCondition({
                name: 'myCondition',
                isValid: function () {
                    return false;
                }
            });

            var command = subdivision.build(subdivision.systemPaths.commands, {name: 'monkey'})[0];
            expect(command).to.be.ok;
            expect(command.canExecute()).to.be.false;

        });
    });

    describe('Get Command', function () {
        it('should get a command with the given name', function () {
            subdivision.addCommand({
                name: 'monkey',
                execute: function () {
                }
            });

            var command = subdivision.getCommand('monkey');
            expect(command).to.be.ok;
            expect(command.name).to.be.equal('monkey');
        });

        it('should not get a command with the given name', function () {
            subdivision.addCommand({
                name: 'monkey',
                execute: function () {
                }
            });

            var command = subdivision.getCommand('monkey2');
            expect(command).to.be.undefined;
        });

        it('should throw if the given name is undefined or null', function () {
            expect(function () {
                subdivision.getCommand();
            }).to.throw('name must not be undefined or null');

            expect(function () {
                subdivision.getCommand(null);
            }).to.throw('name must not be undefined or null');

        });
    });

    describe('Add Command', function(){
        it('should add a condition and initialize it', function () {
            subdivision.addCommand({
                name: 'monkey',
                execute: function () {
                },
                initialize: sinon.stub()
            });

            var command = subdivision.getCommand('monkey');
            expect(command).to.be.ok;
            expect(command.name).to.be.equal('monkey');
            expect(command.initialize.calledOnce).to.be.true;
        });

        it('should throw if the command is not valid', function () {
            expect(function () {
                subdivision.addCommand();
            }).to.throw('Command options must contain the "execute" function');

        });

        it('should return false if the command already exists and force was false', function () {
            subdivision.addCommand({
                name: 'monkey',
                execute: function () {
                }
            });
            var conditionAddResult = subdivision.addCommand({
                name: 'monkey',
                execute: function () {
                }
            });

            expect(conditionAddResult).to.be.false;
        });

        it('should add a command with the same name if force was true', function () {

            var firstCommand = {
                id: '1',
                name: 'monkey',
                execute: function () {
                },
                destroy: sinon.stub()
            };
            subdivision.addCommand(firstCommand);
            subdivision.addCommand({
                id: '2',
                name: 'monkey',
                execute: function () {
                },
                initialize: sinon.stub()
            }, true);
            expect(firstCommand.destroy.calledOnce).to.be.true;
            expect(subdivision.getCommand('monkey')).to.be.ok;
            expect(subdivision.getCommand('monkey').id).to.be.equal('2');
        });
    });

    describe('Remove a command', function () {
        it('should remove an existing command and call its destroy function', function () {
            var command = {
                name: 'monkey',
                execute: function () {
                },
                destroy: sinon.stub()
            };

            subdivision.addCommand(command);
            subdivision.removeCommand('monkey');
            var result = subdivision.getCommand('monkey');
            expect(command.destroy.calledOnce).to.be.true;
            expect(result).to.be.undefined;
        });

        it('should throw if the name was null or undefined', function () {
            expect(function () {
                subdivision.removeCommand();
            }).to.throw('name must not be undefined or null');

            expect(function () {
                subdivision.removeCommand(null);
            }).to.throw('name must not be undefined or null');
        });
    });
});
