describe('BooleanPhraseParser', function () {
    'use strict';
    var expect;
    var subdivision;
    if (typeof window === 'undefined') {
        expect = require('chai').expect;
        subdivision = require('./../../dist/subdivision.node.js');
    } else {
        expect = chai.expect;
        subdivision = window.subdivision;
    }

    var booleanPhraseParser;
    var literalContext;

    var context = {
        and: function (a, b) {
            return a && b;
        },
        or: function (a, b) {
            return a || b;
        },
        not: function (a) {
            return !a;
        },
        literal: function (literalString) {
            return literalContext[literalString];
        }
    };

    //utilities functions
    function evaluate(expression) {
        booleanPhraseParser.evaluate(expression, context);
    }

    beforeEach(function () {
        booleanPhraseParser = new subdivision.utils.BooleanPhraseParser();
    });

    describe('parse', function () {
        it('should throw an error if it was given an empty string', function () {
            expect(function () {
                booleanPhraseParser.parse('');
            }).to.throw('can not evaluate an empty expression');
        });

        it('shuld throw an error if no context is supplied', function () {
            expect(function () {
                booleanPhraseParser.evaluate('t');
            }).to.throw('context was not supplied');
        });

        it('should return a function that given a context can evaluate the boolean expression value ', function () {
            var resultFunction = booleanPhraseParser.parse('A');
            expect(resultFunction).to.be.ok;
            literalContext = {
                A: false,
                B: true
            };

            expect(resultFunction(context)).to.be.false;

            resultFunction = booleanPhraseParser.parse('B');
            expect(resultFunction(context)).to.be.true;

        });
    });

    describe('evaluate', function () {

        beforeEach(function () {
            literalContext = {
                trueVar: true,
                falseVar: false,
                t: true,
                f: false
            };
        });
        it('should return the evaluation of an expression given a context', function () {
            expect(booleanPhraseParser.evaluate('f', context)).to.be.false;
        });

        it('should eveluate an unary not expression correctly', function () {
            expect(booleanPhraseParser.evaluate('!f', context)).to.be.true;
        });

        it('should handle an expresion that is padded with spaces on the left and right', function () {
            expect(booleanPhraseParser.evaluate(' !f ', context)).to.be.true;
        });

        it('should handle all different white spaces', function () {
            expect(booleanPhraseParser.evaluate(' !\t\r\nf ', context)).to.be.true;
            expect(booleanPhraseParser.evaluate(' !\t\r\n(f & \t\r\n (t & \t\r\n f))', context)).to.be.true;
        });

        it('should handle an expresion with parentheses', function () {
            expect(booleanPhraseParser.evaluate('(f)', context)).to.be.false;
        });

        it('should handle not before parentheses', function () {
            expect(booleanPhraseParser.evaluate('!(f)', context)).to.be.true;
        });

        it('should evaluate simple or expression', function () {
            expect(booleanPhraseParser.evaluate('falseVar | trueVar', context)).to.be.true;
        });

        it('should evaluate an OR expresion', function () {
            expect(booleanPhraseParser.evaluate(' trueVar | falseVar ', context)).to.be.true;
            expect(booleanPhraseParser.evaluate(' (trueVar | falseVar) ', context)).to.be.true;
        });

        it('should handle and AND expression', function () {
            expect(booleanPhraseParser.evaluate('falseVar & trueVar', context)).to.be.false;
            expect(booleanPhraseParser.evaluate('falseVar & falseVar', context)).to.be.false;
            expect(booleanPhraseParser.evaluate('trueVar & trueVar', context)).to.be.true;
        });

        it('should handle parentheses', function () {
            expect(booleanPhraseParser.evaluate('(falseVar & trueVar) | trueVar', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('(falseVar & trueVar) | falseVar', context)).to.be.false;
            expect(booleanPhraseParser.evaluate('(trueVar & trueVar) | falseVar', context)).to.be.true;

            expect(booleanPhraseParser.evaluate('(trueVar & trueVar) | (falseVar)', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('((trueVar & trueVar) | (falseVar))', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('((trueVar & trueVar) | (falseVar))', context)).to.be.true;

            expect(booleanPhraseParser.evaluate('((trueVar & trueVar)) | falseVar', context)).to.be.true;
        });

        it('should handle expresions that have operands and operatore with no white sapces in between', function () {
            expect(booleanPhraseParser.evaluate('trueVar&falseVar', context)).to.be.false;
            expect(booleanPhraseParser.evaluate('trueVar|falseVar', context)).to.be.true;
        });

        it('should have precedence between operators AND and OR. AND > OR (AND is evaluated first)', function () {
            expect(booleanPhraseParser.evaluate('trueVar|falseVar&falseVar', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('trueVar&falseVar|falseVar', context)).to.be.false;
            expect(booleanPhraseParser.evaluate('trueVar&falseVar|falseVar', context)).to.be.false;

            expect(booleanPhraseParser.evaluate('t|f&f', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('f|f&t', context)).to.be.false;
            expect(booleanPhraseParser.evaluate('t|t&f', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('f|t&t', context)).to.be.true;

            expect(booleanPhraseParser.evaluate('t&f|f', context)).to.be.false;
            expect(booleanPhraseParser.evaluate('t&f|t', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('t&t|f', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('t&t|t', context)).to.be.true;

            expect(booleanPhraseParser.evaluate('t|f&f|t', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('t|t&f|t', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('f|t&t|t', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('f|t&t|f', context)).to.be.true;
            expect(booleanPhraseParser.evaluate('f|f&t|t', context)).to.be.true; //if AND was not before OR and then would be calculated into false like this(f | (f & (t | t)))

        });

        it('should handle NOT with parenthesis expression', function () {
            expect(booleanPhraseParser.evaluate('!(f|(f&t)|t)', context)).to.be.false;
        });

        it('should handle parameters names that includes spaces in them', function () {
            literalContext['param with spaces'] = true;

            expect(booleanPhraseParser.evaluate('param with spaces& t', context)).true;
            expect(booleanPhraseParser.evaluate('(param with spaces & t)', context)).true;
            expect(booleanPhraseParser.evaluate('!(param with spaces & t)', context)).false;
            expect(booleanPhraseParser.evaluate('!(param with spaces&param with spaces)', context)).false;
        });

        // Error handling:
        it('should throw an exception if there are mismatch parenthesis', function () {
            expect(function () {
                booleanPhraseParser.evaluate('(f&t))',context);
            }).to.throw('mismatch of parentheses');

            expect(function () {
                booleanPhraseParser.evaluate('((f&t)', context);
            }).to.throw('unclosed parentheses');

            expect(function () {
                booleanPhraseParser.evaluate('((f&t))', context);
            }).to.not.throw();
        });

        it('should throw exception if there is a parenthesis and an operand and there is a missing operator', function () {
            expect(function () {
                booleanPhraseParser.evaluate('(t&t)f', context);
            }).to.throw('operator is missing between two operands');
        });

        it('should throw an execption for missing operands', function () {
            expect(function () {
                booleanPhraseParser.evaluate('&', context);
            }).to.throw('one or more operands are missing in expression: &');
        });

        it('should throw error when the left hand side operand is missing', function () {
            expect(function () {
                booleanPhraseParser.evaluate('&t', context);
            }).to.throw('one or more operands are missing in expression: &t');
        });

        it('should throw error when the right hand side operand is missing', function () {
            expect(function () {
                booleanPhraseParser.evaluate('t&', context);
            }).to.throw('one or more operands are missing in expression: t&');
        });

        it('should throw error when there are two operands and no binary operator', function () {
            expect(function () {
                booleanPhraseParser.evaluate('t!t', context);
            }).to.throw('could not resolve literal: t!t');
        });
    });
});
