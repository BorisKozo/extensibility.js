describe.only('Condition', function () {
    'use strict';
    var expect = chai.expect;
    var EJS = window.EJS;

    afterEach(function () {
        EJS.registry.clear();
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
    });

});