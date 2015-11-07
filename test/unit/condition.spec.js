describe('Condition', function () {
    'use strict';
    var expect;
    var subdivision;
    var sinon;
    var _;
    if (typeof window === 'undefined') {
        expect = require('chai').expect;
        sinon = require('sinon');
        subdivision = require('./../../dist/subdivision.node.js');
        _ = require('lodash');
    } else {
        expect = chai.expect;
        subdivision = window.subdivision;
        sinon = window.sinon;
        _ = window._;
    }

    beforeEach(function () {
        subdivision.registry.$clear();
        subdivision.$clearBuilders();
        subdivision.$clearConditions();
    });

    describe('Create a condition', function () {
        it('should create a condition', function () {
            var condition = new subdivision.Condition({
                id: 'aa',
                name: 'bb',
                isValid: function () {
                }
            });
            expect(condition).to.be.ok;
            expect(condition.id).to.be.equal('aa');
            expect(condition.name).to.be.equal('bb');

            condition = new subdivision.Condition({
                isValid: function () {
                }
            });

            expect(condition.id).to.be.ok;
            expect(condition.name).to.be.equal(condition.id);
        });

        it('should throw if a condition is created without isValid function', function () {
            expect(function () {
                var condition = new subdivision.Condition({});
            }).to.throw('A condition must have an isValid function');
        });
    });

    describe('Get a condition', function () {
        it('should get a condition with the given name', function () {
            subdivision.addCondition({
                name: 'monkey',
                isValid: function () {
                }
            });

            var condition = subdivision.getCondition('monkey');
            expect(condition).to.be.ok;
            expect(condition.name).to.be.equal('monkey');
        });

        it('should not get a condition with the given name', function () {
            subdivision.addCondition({
                name: 'monkey',
                isValid: function () {
                }
            });

            var condition = subdivision.getCondition('monkey2');
            expect(condition).to.be.undefined;
        });

        it('should throw if the given name is undefined or null', function () {
            expect(function () {
                subdivision.getCondition();
            }).to.throw('name must not be undefined or null');

            expect(function () {
                subdivision.getCondition(null);
            }).to.throw('name must not be undefined or null');

        });
    });

    describe('Add a condition', function () {
        it('should add a condition and initialize it', function () {
            subdivision.addCondition({
                name: 'monkey',
                isValid: function () {
                },
                initialize: sinon.stub()
            });

            var condition = subdivision.getCondition('monkey');
            expect(condition).to.be.ok;
            expect(condition.name).to.be.equal('monkey');
            expect(condition.initialize.calledOnce).to.be.true;
        });

        it('should throw if the condition is not valid', function () {
            expect(function () {
                subdivision.addCondition();
            }).to.throw('A condition must have an isValid function');

        });

        it('should return false if the condition already exists and force was false', function () {
            subdivision.addCondition({
                name: 'monkey',
                isValid: function () {
                },
                initialize: sinon.stub()
            });
            var conditionAddResult = subdivision.addCondition({
                name: 'monkey',
                isValid: function () {
                },
                initialize: sinon.stub()
            });

            expect(conditionAddResult).to.be.false;

        });

        it('should add a condition with the same name if force was true', function () {

            var firstCondition = {
                id: '1',
                name: 'monkey',
                isValid: function () {
                },
                initialize: sinon.stub(),
                destroy: sinon.stub()
            };
            subdivision.addCondition(firstCondition);
            subdivision.addCondition({
                id: '2',
                name: 'monkey',
                isValid: function () {
                },
                initialize: sinon.stub()
            }, true);
            expect(firstCondition.destroy.calledOnce).to.be.true;
            expect(subdivision.getCondition('monkey')).to.be.ok;
            expect(subdivision.getCondition('monkey').id).to.be.equal('2');
        });
    });

    describe('Remove a condition', function () {
        it('should remove an existing condition and call its destroy function', function () {
            var condition = {
                name: 'monkey',
                isValid: function () {
                },
                destroy: sinon.stub()
            };

            subdivision.addCondition(condition);
            subdivision.removeCondition('monkey');
            var result = subdivision.getCondition('monkey');
            expect(condition.destroy.calledOnce).to.be.true;
            expect(result).to.be.undefined;
        });

        it('should throw if the name was null or undefined', function () {
            expect(function () {
                subdivision.removeCondition();
            }).to.throw('name must not be undefined or null');

            expect(function () {
                subdivision.removeCondition(null);
            }).to.throw('name must not be undefined or null');
        });
    });

    describe('Condition operators', function () {

        var operations;
        beforeEach(function () {
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.addCondition({
                name: "trueCondition",
                isValid: function () {
                    return true;
                }
            });
            subdivision.addCondition({
                name: "falseCondition",
                isValid: function () {
                    return false;
                }
            });
            subdivision.$generateBuilders();
            operations = subdivision.build(subdivision.systemPaths.conditionOperations)

        });

        it('should build a condition operation', function () {
            subdivision.readManifest({
                paths: [{
                    path: subdivision.systemPaths.conditionOperations,
                    addins: [
                        {
                            literal: 'aaa',
                            type: 'subdivision.conditionOperation',
                            generator: function (element) {
                                return element;
                            }
                        }

                    ]
                }]
            });

            subdivision.addBuilder(subdivision.Condition.$conditionOperationBuilder);

            var result = subdivision.build(subdivision.systemPaths.conditionOperations,{}, {literal: 'aaa'});
            expect(result.length).to.be.equal(1);
            expect(result[0].literal).to.be.equal('aaa');
            expect(result[0].generator('bbb')).to.be.equal('bbb');
        });

        it('should perform the not operation correctly', function () {
            var notOperator = _.find(operations, {literal: '!'});
            expect(notOperator).to.be.ok;
            var condition = notOperator.generator(subdivision.getCondition('trueCondition'));
            expect(condition.isValid()).to.be.false;
            condition = notOperator.generator(subdivision.getCondition('falseCondition'));
            expect(condition.isValid()).to.be.true;
        });

        it('should perform the and operation correctly', function () {
            var andOperator = _.find(operations, {literal: '&'});
            var trueCondition = subdivision.getCondition('trueCondition');
            var falseCondition = subdivision.getCondition('falseCondition');

            expect(andOperator).to.be.ok;
            expect(andOperator.generator(trueCondition, trueCondition).isValid()).to.be.true;
            expect(andOperator.generator(trueCondition, falseCondition).isValid()).to.be.false;
            expect(andOperator.generator(falseCondition, trueCondition).isValid()).to.be.false;
            expect(andOperator.generator(falseCondition, falseCondition).isValid()).to.be.false;
        });

        it('should perform the or operation correctly', function () {
            var orOperator = _.find(operations, {literal: '|'});
            var trueCondition = subdivision.getCondition('trueCondition');
            var falseCondition = subdivision.getCondition('falseCondition');

            expect(orOperator).to.be.ok;
            expect(orOperator.generator(trueCondition, trueCondition).isValid()).to.be.true;
            expect(orOperator.generator(trueCondition, falseCondition).isValid()).to.be.true;
            expect(orOperator.generator(falseCondition, trueCondition).isValid()).to.be.true;
            expect(orOperator.generator(falseCondition, falseCondition).isValid()).to.be.false;
        });

    });

    describe('Condition with parsed isValid', function () {
        beforeEach(function () {
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.addCondition({
                name: "trueCondition",
                isValid: function () {
                    return true;
                }
            });
            subdivision.addCondition({
                name: "falseCondition",
                isValid: function () {
                    return false;
                }
            });
            subdivision.$generateBuilders();
        });

        it('should be able to duplicate an existing condition', function () {
            subdivision.addCondition(new subdivision.Condition({
                name: "duplicateFalseCondition",
                isValid: "falseCondition"
            }));

            var condition = subdivision.getCondition("duplicateFalseCondition");
            expect(condition).to.be.ok;
            expect(condition.isValid()).to.be.false;
        });

        it('should be able to create a not condition', function () {
            subdivision.addCondition(new subdivision.Condition({
                name: "notFalseCondition",
                isValid: "!falseCondition"
            }));

            var condition = subdivision.getCondition("notFalseCondition");
            expect(condition).to.be.ok;
            expect(condition.isValid()).to.be.true;
        });


        it('should be able to create a not not condition', function () {
            subdivision.addCondition(new subdivision.Condition({
                name: "notFalseCondition",
                isValid: "!falseCondition"
            }));

            subdivision.addCondition(new subdivision.Condition({
                name: "notNotFalseCondition",
                isValid: "!notFalseCondition"
            }));

            var condition = subdivision.getCondition("notNotFalseCondition");
            expect(condition).to.be.ok;
            expect(condition.isValid()).to.be.false;
        });

        it('should be able to create an and condition', function () {
            subdivision.addCondition(new subdivision.Condition({
                name: "andTrueFalseCondition",
                isValid: "(trueCondition & falseCondition)"
            }));

            var condition = subdivision.getCondition("andTrueFalseCondition");
            expect(condition).to.be.ok;
            expect(condition.isValid()).to.be.false;
        });

        it('should be able to create an or condition', function () {
            subdivision.addCondition(new subdivision.Condition({
                name: "orTrueFalseCondition",
                isValid: "(trueCondition | falseCondition)"
            }));

            var condition = subdivision.getCondition("orTrueFalseCondition");
            expect(condition).to.be.ok;
            expect(condition.isValid()).to.be.true;
        });

        it('should be able to create a complex condition - de Morgan', function () {
            var a = true;
            var b = false;

            subdivision.addCondition(new subdivision.Condition({
                name: "a",
                isValid: function () {
                    return a;
                }
            }));

            subdivision.addCondition(new subdivision.Condition({
                name: "b",
                isValid: function () {
                    return b;
                }
            }));


            subdivision.addCondition(new subdivision.Condition({
                name: "deMorganLeft",
                isValid: "!(a | b)"
            }));

            subdivision.addCondition(new subdivision.Condition({
                name: "deMorganRight",
                isValid: "!a & !b"
            }));

            subdivision.addCondition(new subdivision.Condition({
                name: "deMorganFull",
                isValid: "deMorganLeft | !deMorganRight"
            }));


            var condition = subdivision.getCondition("deMorganFull");
            expect(condition).to.be.ok;
            a = true;
            b = true;
            expect(condition.isValid()).to.be.true;
            a = true;
            b = false;
            expect(condition.isValid()).to.be.true;
            a = false;
            b = true;
            expect(condition.isValid()).to.be.true;
            a = false;
            b = false;
            expect(condition.isValid()).to.be.true;

        });

    });

    describe('Condition builder', function () {
        it('should build a condition', function () {
            subdivision.readManifest(subdivision.defaultManifest);
            subdivision.readManifest({
                paths: [
                    {
                        path: subdivision.systemPaths.conditions,
                        addins: [
                            {
                                id: 'condition1',
                                name: 'monkey',
                                type: 'subdivision.condition',
                                order: 1,
                                isValid: function () {
                                    return true;

                                }
                            }
                        ]
                    }
                ]
            });
            subdivision.$generateBuilders();

            var condition = subdivision.build(subdivision.systemPaths.conditions, {name: 'monkey'})[0];
            expect(condition).to.be.ok;
            expect(condition.isValid()).to.be.true;

        });
    });

});
