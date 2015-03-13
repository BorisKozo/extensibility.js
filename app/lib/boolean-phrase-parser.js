(function () {
    'use strict';

    //constants:
    var openParethesisChar = '(';
    var closeParethesisChar = ')';
    var notChar = '!';
    var orChar = '|';
    var andChar = '&';

    function ExpressionNode(stringExpression, depth) {
        this.data = null;
        this.depth = depth;

        if (_.isEmpty(stringExpression)) {
            throw new Error('can not evaluate an empty expression');
        }

        stringExpression = stringExpression.trim();

        var removedAllParentheses = false;
        var result;
        while (!removedAllParentheses) {
            result = this.analyzeExpression(stringExpression);
            if (result.parenthesesExpression) {
                //peal off the parentheses
                stringExpression = stringExpression.substring(1, stringExpression.length - 1);
            } else {
                removedAllParentheses = true;
            }
        }

        if (result.unaryOperator) {
            var childSubTree = new ExpressionNode(result.expression, this.depth + 1);
            this.data = this.createUnaryNotNodeData(childSubTree);
        } else if (result.literal) {
            this.data = this.createLiteralNodeData(result.literal);
        } else if (result.binaryOperator) {
            this.data = this.createBinaryOperandNodeData(
                new ExpressionNode(result.leftOperand, this.depth + 1),
                new ExpressionNode(result.rightOperand, this.depth + 1),
                result.binaryOperator);
        } else {
            throw new Error('could not analyze expression: ' + stringExpression);
        }
    }

    ExpressionNode.prototype.analyzeExpression = function (expression) {
        var openParentheses = 0;
        var closeParentheses = 0;
        var binaryOperator = null;
        var leftOperatorEndIndex = 0;
        var currentChar;

        for (var i = 0, length = expression.length; i < length; i++) {
            currentChar = expression[i];

            if (currentChar === openParethesisChar) {
                openParentheses++;
            } else if (currentChar === closeParethesisChar) {
                closeParentheses++;
            }

            if (this.isWhiteSpaceChar(currentChar)) {
                continue;
            }

            if (openParentheses > closeParentheses) {
                continue;
            } else if ((openParentheses === closeParentheses) && this.isBinaryOperand(currentChar)) {
                //there are two cases:
                //(1) if we don't have a binaryOperator yet save the currentChar as the one
                //(2) if we do have one already and it's AND and the current one is OR prefer it (this creates the AND>OR operator precedence)
                //    the AND will be left to be created as one of the children in the tree and thus evaluated first.
                if ((!binaryOperator) ||
                    (binaryOperator && binaryOperator === andChar && currentChar === orChar)) {
                    binaryOperator = currentChar;
                    leftOperatorEndIndex = i;
                }

            } else if (closeParentheses > openParentheses) {
                //TODO: add some more information here
                throw new Error('mismatch of parentheses');
            }
        }

        if (binaryOperator !== null) {
            var leftOperand = expression.substring(0, leftOperatorEndIndex).trim();
            var rightOperand =  expression.substring(leftOperatorEndIndex + 1, expression.length + 1).trim();
            if(!(leftOperand && rightOperand)){
                throw new Error('one or more operands are missing in expression: ' +  expression);
            }
            // exp & exp
            return {
                leftOperand: leftOperand,
                binaryOperator: binaryOperator,
                rightOperand: rightOperand
            };
        } else { //binaryOperator === null
            if (expression[0] === openParethesisChar) {
                if (openParentheses === closeParentheses) {
                    if(expression[expression.length - 1] === closeParethesisChar) {
                        // (exp)
                        return {
                            parenthesesExpression: true
                        };
                    } else {
                        // (exp)bla
                        throw new Error('operator is missing between two operands');
                    }
                } else if (openParentheses > closeParentheses) {
                    //((exp) unclosed parentheses case (the other case we should be getting on the previous code
                    //TODO add some more info here
                    throw new Error('unclosed parentheses');
                } else {
                    // (exp)) this case is actually handled when running through the chars (just in case)
                    throw new Error('mismatch of parentheses');
                }
            } else if (expression[0] === notChar) {
                //!exp
                return {
                    unaryOperator: notChar,
                    expression: expression.substring(1, expression.length + 1)
                };
            } else if (openParentheses === 0) {
                //literal
                return {
                    literal: expression
                };
            } else {
                //there must be an error here
                throw new Error('should not have happened. expresion does not fall into any one of the patterns');
            }
        }
    };

    ExpressionNode.prototype.isBinaryOperand = function (char) {
        return char === orChar || char === andChar;
    };

    ExpressionNode.prototype.isWhiteSpaceChar = function (char) {
        return char !== char.trim();
    };

    ExpressionNode.prototype.createUnaryNotNodeData = function (childNode) {
        return {
            operator: notChar,
            child: childNode,
            evaluate: function (context) {
                return context.not(childNode.evaluate(context));
            }
        };
    };

    ExpressionNode.prototype.createLiteralNodeData = function (literal) {
        return {
            literal: literal,
            evaluate: function (context) {
                var resolvedLiteral = context.literal(literal);
                if(resolvedLiteral === null || resolvedLiteral === undefined){
                    throw new Error('could not resolve literal: ' + literal);
                }
                return resolvedLiteral;
            }
        };
    };

    ExpressionNode.prototype.createBinaryOperandNodeData = function (leftChildSubtree, rightChildSubtree, operator) {
        return {
            operator: operator,
            leftChildNode: leftChildSubtree,
            rightChildNode: rightChildSubtree,
            evaluate: function (context) {
                if (this.operator === orChar) {
                    return context.or(leftChildSubtree.evaluate(context), rightChildSubtree.evaluate(context));
                } else if (this.operator === andChar) {
                    return context.and(leftChildSubtree.evaluate(context), rightChildSubtree.evaluate(context));
                }
            }
        };
    };

    ExpressionNode.prototype.evaluate = function (context) {
        return this.data.evaluate(context);
    };

    function BooleanPhraseParser() {
        this.expresionTreeRoot = null;
    }

    BooleanPhraseParser.prototype.parse = function (stringExpression) {
        this.expresionTreeRoot = new ExpressionNode(stringExpression, 0);
        var expresionRoot = this.expresionTreeRoot;
        return function (context) {
            return expresionRoot.evaluate(context);
        };
    };

    BooleanPhraseParser.prototype.evaluate = function (stringExpression, context) {
        if (!context) {
            throw new Error('context was not supplied');
        }
        return this.parse(stringExpression)(context);
    };

    EJS.BooleanPhraseParser = BooleanPhraseParser;
})();