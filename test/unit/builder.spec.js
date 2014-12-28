describe('Builder', function () {
    'use strict';
    var expect = chai.expect;
    var EJS = window.EJS;

    afterEach(function () {
        EJS.registry.clear();
    });

    describe('Create a builder', function () {
        it('should throw if there was no build function defined', function () {
            expect(function () {
                new EJS.Builder();
            }).to.throw('Builder options must contain the "build" function');
        });

        it('Should create a builder without options', function () {
            var builder = new EJS.Builder({
                build: function () {
                }
            });
            expect(builder.id.indexOf('builder')).to.be.equal(0);
            expect(builder.order).to.be.equal(0);
            expect(builder.type).to.be.equal('');
            var builder2 = new EJS.Builder({
                build: function () {
                }
            });
            expect(builder.id).not.to.be.equal(builder2.id);
        });

        it('Should create an addin with options function', function () {
            var builder = new EJS.Builder(function () {
                return {
                    id: 'abc',
                    order: 3,
                    type: 'monkey',
                    build: function () {
                    }
                }
            });
            expect(builder.id).to.be.equal('abc');
            expect(builder.order).to.be.equal(3);
            expect(builder.type).to.be.equal('monkey');
        });

        it('Should create an addin with options object', function () {
            var builder = new EJS.Builder({
                id: 'abc',
                order: 3,
                type: 'monkey',
                build: function () {
                }
            });
            expect(builder.id).to.be.equal('abc');
            expect(builder.order).to.be.equal(3);
            expect(builder.type).to.be.equal('monkey');
        });
    });

    describe('Add a builder', function () {
        it('should add a builder', function () {
            var options = {
                id: 'abc',
                order: 3,
                type: 'monkey',
                build: function () {
                }
            };

            EJS.registry.addBuilder(options);
            var builder = EJS.registry.getBuilder('monkey');
            expect(builder.id).to.be.equal('abc');
            expect(builder.order).to.be.equal(3);
            expect(builder.type).to.be.equal('monkey');
        });
    });

    describe('Get builders', function () {
        it('should get a builder with the given type', function () {
            var options = {
                type: 'monkey',
                build: function () {
                }
            };

            EJS.registry.addBuilder(options);
            var builder = EJS.registry.getBuilder('monkey');
            expect(builder.type).to.be.equal('monkey');
        });

        it('should get a builder with type === null if no appropriate builder is found', function () {
            EJS.registry.addBuilder({
                id: 'a',
                type: 'monkey',
                build: function () {
                }
            });

            EJS.registry.addBuilder({
                id: 'b',
                type: null,
                build: function () {
                }
            });

            var builder = EJS.registry.getBuilder('no such type');
            expect(builder.id).to.be.equal('b');
        });

        it('should throw if there is no default builder and no appropriate builder is found', function () {
            EJS.registry.addBuilder({
                id: 'a',
                type: 'monkey',
                build: function () {
                }
            });
            expect(function () {
                EJS.registry.getBuilder('no such type');
            }).to.throw('No builder of type "no such type" was defined and no default builder was registered');
        });
    });

    describe('Build', function () {
        it('should build a path with a couple of addins in it', function () {
            EJS.registry.addBuilder({
                id: 'a',
                type: 'monkey',
                build: function (addin) {
                    return addin.id;
                }
            });

            EJS.registry.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            EJS.registry.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            var items = EJS.registry.build('aaa');
            expect(items).to.be.ok;
            expect(items.length).to.be.equal(2);
            expect(items[0]).to.be.equal('1');
            expect(items[1]).to.be.equal('2');
        });

        it('should return empty array if there are no addins to build', function () {
            EJS.registry.addBuilder({
                id: 'a',
                type: 'monkey',
                build: function (addin) {
                    return addin.id;
                }
            });

            EJS.registry.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            EJS.registry.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            var items = EJS.registry.build('bbb');
            expect(items.length).to.be.equal(0);
        });
    });
});