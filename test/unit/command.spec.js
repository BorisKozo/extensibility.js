describe('Command', function () {
    'use strict';
    var expect = chai.expect;
    var EJS = window.EJS;

    beforeEach(function () {
        EJS.registry.$clear();
        EJS.$clearBuilders();
        EJS.$clearCommands();
        EJS.$clearConditions();
    });

    describe('Create a command', function () {
        it('should create a command', function () {
            var command = new EJS.Command({
                id: 'aa',
                name: 'bb',
                execute: function () {
                }
            });
            expect(command).to.be.ok;
            expect(command.id).to.be.equal('aa');
            expect(command.name).to.be.equal('bb');

            command = new EJS.Command({
                execute: function () {
                }
            });

            expect(command.id).to.be.ok;
            expect(command.name).to.be.equal(command.id);
        });

        it('should throw if a command is created without execute function', function () {
            expect(function () {
                var condition = new EJS.Command({});
            }).to.throw('Command options must contain the "execute" function');
        });

        it('should provide a default truthy isValid function if it was not defined', function () {
            var command = new EJS.Command({
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
                var command = new EJS.Command({
                    execute: function () {
                    },
                    canExecute: canExecute
                });

                expect(command.canExecute).to.be.equal(canExecute);
            });

            it('should use the value of the condition if such is provided', function () {
                var isValidResult = true;
                EJS.addCondition({
                    name: 'hello',
                    isValid: function () {
                        return isValidResult;
                    }
                });

                var command = new EJS.Command({
                    condition: 'hello',
                    execute: function () {
                    }
                });

                expect(command.canExecute()).to.be.equal(isValidResult);
                isValidResult = false;
                expect(command.canExecute()).to.be.equal(isValidResult);
                isValidResult = true;

                command = new EJS.Command({
                    condition: new EJS.Condition({
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
                var command = new EJS.Command({
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
            EJS.readManifest(EJS.defaultManifest);

            EJS.readManifest({
                paths: [
                    {
                        path: EJS.systemPaths.commands,
                        addins: [
                            {
                                id: 'command1',
                                name: 'monkey',
                                type: 'EJS.command',
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
            EJS.generateBuilders();

            EJS.addCondition({
                name: 'myCondition',
                isValid: function () {
                    return false;
                }
            });

            var command = EJS.build(EJS.systemPaths.commands, {name: 'monkey'})[0];
            expect(command).to.be.ok;
            expect(command.canExecute()).to.be.false;

        });
    });

    describe('Get Command', function () {
        it('should get a command with the given name', function () {
            EJS.addCommand({
                name: 'monkey',
                execute: function () {
                }
            });

            var command = EJS.getCommand('monkey');
            expect(command).to.be.ok;
            expect(command.name).to.be.equal('monkey');
        });

        it('should not get a command with the given name', function () {
            EJS.addCommand({
                name: 'monkey',
                execute: function () {
                }
            });

            var command = EJS.getCommand('monkey2');
            expect(command).to.be.undefined;
        });

        it('should throw if the given name is undefined or null', function () {
            expect(function () {
                EJS.getCommand();
            }).to.throw('name must not be undefined or null');

            expect(function () {
                EJS.getCommand(null);
            }).to.throw('name must not be undefined or null');

        });
    });

    describe('Add Command', function(){
        it('should add a condition and initialize it', function () {
            EJS.addCommand({
                name: 'monkey',
                execute: function () {
                },
                initialize: sinon.stub()
            });

            var command = EJS.getCommand('monkey');
            expect(command).to.be.ok;
            expect(command.name).to.be.equal('monkey');
            expect(command.initialize.calledOnce).to.be.true;
        });

        it('should throw if the command is not valid', function () {
            expect(function () {
                EJS.addCommand();
            }).to.throw('Command options must contain the "execute" function');

        });

        it('should return false if the command already exists and force was false', function () {
            EJS.addCommand({
                name: 'monkey',
                execute: function () {
                }
            });
            var conditionAddResult = EJS.addCommand({
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
            EJS.addCommand(firstCommand);
            EJS.addCommand({
                id: '2',
                name: 'monkey',
                execute: function () {
                },
                initialize: sinon.stub()
            }, true);
            expect(firstCommand.destroy.calledOnce).to.be.true;
            expect(EJS.getCommand('monkey')).to.be.ok;
            expect(EJS.getCommand('monkey').id).to.be.equal('2');
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

            EJS.addCommand(command);
            EJS.removeCommand('monkey');
            var result = EJS.getCommand('monkey');
            expect(command.destroy.calledOnce).to.be.true;
            expect(result).to.be.undefined;
        });

        it('should throw if the name was null or undefined', function () {
            expect(function () {
                EJS.removeCommand();
            }).to.throw('name must not be undefined or null');

            expect(function () {
                EJS.removeCommand(null);
            }).to.throw('name must not be undefined or null');
        });
    });
});
