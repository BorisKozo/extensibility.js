describe('Condition', function () {
    'use strict';
    var expect = chai.expect;
    var EJS = window.EJS;

    afterEach(function () {
        EJS.registry.$clear();
        EJS.$clearConditions();
    });

    describe('Create a condition', function () {
        it('should create a condition', function () {
            var condition = new EJS.Condition({
                id: 'aa',
                name: 'bb',
                isValid: function () {
                }
            });
            expect(condition).to.be.ok;
            expect(condition.id).to.be.equal('aa');
            expect(condition.name).to.be.equal('bb');

            condition = new EJS.Condition({
                isValid: function () {
                }
            });

            expect(condition.id).to.be.ok;
            expect(condition.name).to.be.equal(condition.id);
        });

        it('should throw if a condition is created without isValid function', function () {
            expect(function () {
                var condition = new EJS.Condition({});
            }).to.throw('A condition must have an isValid function');
        });
    });

    describe('Get a condition', function () {
        it('should get a condition with the given name', function () {
            EJS.addCondition(new EJS.Condition({
                name: 'monkey',
                isValid: function () {
                }
            }));

            var condition = EJS.getCondition('monkey');
            expect(condition).to.be.ok;
            expect(condition.name).to.be.equal('monkey');
        });

        it('should not get a condition with the given name', function () {
            EJS.addCondition(new EJS.Condition({
                name: 'monkey',
                isValid: function () {
                }
            }));

            var condition = EJS.getCondition('monkey2');
            expect(condition).to.be.undefined;
        });

        it('should throw if the given name is undefined or null', function () {
            expect(function () {
                EJS.getCondition();
            }).to.throw('name must not be undefined or null');

            expect(function () {
                EJS.getCondition(null);
            }).to.throw('name must not be undefined or null');

        });
    });

    describe('Add a condition', function () {
        it('should add a condition and initialize it', function () {
            EJS.addCondition(new EJS.Condition({
                name: 'monkey',
                isValid: function () {
                },
                initialize: sinon.stub()
            }));

            var condition = EJS.getCondition('monkey');
            expect(condition).to.be.ok;
            expect(condition.name).to.be.equal('monkey');
            expect(condition.initialize.calledOnce).to.be.true;
        });

        it('should throw if the condition is not valid', function () {
            expect(function () {
                EJS.addCondition();
            }).to.throw('condition must be a condition object: undefined');

        });

        it('should throw if the name is undefined or null', function () {
            expect(function () {
                EJS.addCondition({
                    name: null
                });
            }).to.throw('name must not be undefined or null');

            expect(function () {
                EJS.addCondition({});
            }).to.throw('name must not be undefined or null');
        });

        it('should throw if the condition already exists and force was false', function () {
            EJS.addCondition(new EJS.Condition({
                name: 'monkey',
                isValid: function () {
                },
                initialize: sinon.stub()
            }));
            expect(function () {
                EJS.addCondition(new EJS.Condition({
                    name: 'monkey',
                    isValid: function () {
                    },
                    initialize: sinon.stub()
                }));
            }).to.throw('A condition with the name monkey already exists');
        });

        it('should add a condition with the same name if force was true', function () {
            var firstCondition = new EJS.Condition({
                name: 'monkey',
                isValid: function () {
                },
                initialize: sinon.stub(),
                destroy: sinon.stub()
            });

            EJS.addCondition(firstCondition);
            EJS.addCondition(new EJS.Condition({
                name: 'monkey',
                isValid: function () {
                },
                initialize: sinon.stub()
            }), true);
            expect(firstCondition.destroy.calledOnce).to.be.true;
            expect(EJS.getCondition('monkey')).to.be.ok;
            expect(EJS.getCondition('monkey')).not.to.be.equal(firstCondition);
        });
    });

    describe('Remove a condition', function () {
        it('should remove an existing condition and call its destroy function', function () {
            var condition = new EJS.Condition({
                name: 'monkey',
                isValid: function () {
                },
                destroy: sinon.stub()
            });

            EJS.addCondition(condition);
            EJS.removeCondition('monkey');
            var result = EJS.getCondition('monkey');
            expect(condition.destroy.calledOnce).to.be.true;
            expect(result).to.be.undefined;
        });

        it('should throw if the name was null or undefined', function () {
            expect(function () {
                EJS.removeCondition();
            }).to.throw('name must not be undefined or null');

            expect(function () {
                EJS.removeCondition(null);
            }).to.throw('name must not be undefined or null');
        });
    });

    describe('Condition operators', function () {

        var operations;
        beforeEach(function () {
            EJS.readManifest(EJS.defaultManifest);
            EJS.addCondition({
                name: "trueCondition",
                isValid: function () {
                    return true;
                }
            });
            EJS.addCondition({
                name: "falseCondition",
                isValid: function () {
                    return false;
                }
            });
            operations = EJS.build(EJS.systemPaths.conditionOperations)

        });

        it('should build a condition operation', function () {
            EJS.readManifest({
                paths: [{
                    path: EJS.systemPaths.conditionOperations,
                    addins: [
                        {
                            literal: 'aaa',
                            type: 'EJS.conditionOperation',
                            generator: function (element) {
                                return element;
                            }
                        }

                    ]
                }]
            });

            EJS.addBuilder(EJS.Condition.$conditionOperationBuilder);

            var result = EJS.build(EJS.systemPaths.conditionOperations,{literal:'aaa'});
            expect(result.length).to.be.equal(1);
            expect(result[0].literal).to.be.equal('aaa');
            expect(result[0].generator('bbb')).to.be.equal('bbb');
        });

        it('should perform the not operation correctly', function () {
            var notOperator = _.find(operations, {literal: '!'});
            expect(notOperator).to.be.ok;
            var condition = notOperator.generator(EJS.getCondition('trueCondition'));
            expect(condition.isValid()).to.be.false;
            condition = notOperator.generator(EJS.getCondition('falseCondition'));
            expect(condition.isValid()).to.be.true;
        });

        it('should perform the and operation correctly', function () {
            var andOperator = _.find(operations, {literal: '&'});
            var trueCondition = EJS.getCondition('trueCondition');
            var falseCondition = EJS.getCondition('falseCondition');

            expect(andOperator).to.be.ok;
            expect(andOperator.generator(trueCondition, trueCondition).isValid()).to.be.true;
            expect(andOperator.generator(trueCondition, falseCondition).isValid()).to.be.false;
            expect(andOperator.generator(falseCondition, trueCondition).isValid()).to.be.false;
            expect(andOperator.generator(falseCondition, falseCondition).isValid()).to.be.false;
        });

        it('should perform the or operation correctly', function () {
            var orOperator = _.find(operations, {literal: '|'});
            var trueCondition = EJS.getCondition('trueCondition');
            var falseCondition = EJS.getCondition('falseCondition');

            expect(orOperator).to.be.ok;
            expect(orOperator.generator(trueCondition, trueCondition).isValid()).to.be.true;
            expect(orOperator.generator(trueCondition, falseCondition).isValid()).to.be.true;
            expect(orOperator.generator(falseCondition, trueCondition).isValid()).to.be.true;
            expect(orOperator.generator(falseCondition, falseCondition).isValid()).to.be.false;
        });

    });

})
;
