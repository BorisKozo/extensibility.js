describe('EventBusService', function () {
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

    it('on and trigger', function () {
        var obj = {counter: 0};
        obj = subdivision.createEventBus(obj);
        obj.on('event', function () {
            obj.counter += 1;
        });
        obj.trigger('event');
        expect(obj.counter).to.equal(1, 'counter should be incremented.');
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        expect(obj.counter).to.equal(5, 'counter should be incremented five times.');
    });

    it('binding and triggering multiple events', function () {
        var obj = {counter: 0};
        obj = subdivision.createEventBus(obj);

        obj.on('a b c', function () {
            obj.counter += 1;
        });

        obj.trigger('a');
        expect(obj.counter).to.equal(1);

        obj.trigger('a b');
        expect(obj.counter).to.equal(3);

        obj.trigger('c');
        expect(obj.counter).to.equal(4);

        obj.off('a c');
        obj.trigger('a b c');
        expect(obj.counter).to.equal(5);
    });

    it('binding and triggering with event maps', function () {
        var obj = {counter: 0};
        obj = subdivision.createEventBus(obj);

        var increment = function () {
            this.counter += 1;
        };

        obj.on({
            a: increment,
            b: increment,
            c: increment
        }, obj);

        obj.trigger('a');
        expect(obj.counter).to.equal(1);

        obj.trigger('a b');
        expect(obj.counter).to.equal(3);

        obj.trigger('c');
        expect(obj.counter).to.equal(4);

        obj.off({
            a: increment,
            c: increment
        }, obj);
        obj.trigger('a b c');
        expect(obj.counter).to.equal(5);
    });

    it('listenTo and stopListening', function () {
        var a = subdivision.createEventBus();
        var b = subdivision.createEventBus();
        var callbackA = sinon.spy();
        var callbackB = sinon.spy();
        a.listenTo(b, 'all', callbackA);
        b.trigger('anything');
        a.listenTo(b, 'all', callbackB);
        a.stopListening();
        b.trigger('anything');

        expect(callbackA.calledOnce).to.be.true;
        expect(callbackB.called).to.be.false;
    });

    it('listenTo and stopListening with event maps', function () {
        var a = subdivision.createEventBus();
        var b = subdivision.createEventBus();
        var cb = sinon.spy();
        a.listenTo(b, {event: cb});
        b.trigger('event');
        a.listenTo(b, {event2: cb});
        b.on('event2', cb);
        a.stopListening(b, {event2: cb});
        b.trigger('event event2');
        a.stopListening();
        b.trigger('event event2');

        expect(cb.callCount).to.equal(4);
    });

    it('stopListening with omitted args', function () {
        var a = subdivision.createEventBus();
        var b = subdivision.createEventBus();

        var cb = sinon.spy();
        a.listenTo(b, 'event', cb);
        b.on('event', cb);
        a.listenTo(b, 'event2', cb);
        a.stopListening(null, {event: cb});
        b.trigger('event event2');
        b.off();
        a.listenTo(b, 'event event2', cb);
        a.stopListening(null, 'event');
        a.stopListening();
        b.trigger('event2');

        expect(cb.callCount).to.equal(2);
    });

    it('listenToOnce and stopListening', function () {
        var a = subdivision.createEventBus();
        var b = subdivision.createEventBus();

        var cb = sinon.spy();
        a.listenToOnce(b, 'all', cb);
        b.trigger('anything');
        b.trigger('anything');
        a.listenToOnce(b, 'all', cb);
        a.stopListening();
        b.trigger('anything');

        expect(cb.callCount).to.equal(1);
    });

    it('listenTo, listenToOnce and stopListening', function () {
        var a = subdivision.createEventBus();
        var b = subdivision.createEventBus();
        var cb = sinon.spy();
        a.listenToOnce(b, 'all', cb);
        b.trigger('anything');
        b.trigger('anything');
        a.listenTo(b, 'all', cb);
        a.stopListening();
        b.trigger('anything');

        expect(cb.callCount).to.equal(1);
    });

    it('listenTo and stopListening with event maps', function () {
        var a = subdivision.createEventBus();
        var b = subdivision.createEventBus();
        var cb = sinon.spy();
        a.listenTo(b, {change: cb});
        b.trigger('change');
        a.listenTo(b, {change: cb});
        a.stopListening();
        b.trigger('change');

        expect(cb.callCount).to.equal(1);
    });

    it('listenTo yourself', function () {
        var e = subdivision.createEventBus();
        var cb = sinon.spy();
        e.listenTo(e, 'foo', cb);
        e.trigger('foo');

        expect(cb.callCount).to.equal(1);
    });

    it('listenTo yourself cleans yourself up with stopListening', function () {
        var e = subdivision.createEventBus();
        var cb = sinon.spy();
        e.listenTo(e, 'foo', cb);
        e.trigger('foo');
        e.stopListening();
        e.trigger('foo');

        expect(cb.callCount).to.equal(1);
    });

    it('stopListening cleans up references', function () {
        var a = subdivision.createEventBus();
        var b = subdivision.createEventBus();
        var fn = function () {
        };
        a.listenTo(b, 'all', fn).stopListening();
        expect(_.size(a._listeningTo)).to.equal(0);
        a.listenTo(b, 'all', fn).stopListening(b);
        expect(_.size(a._listeningTo)).to.equal(0);
        a.listenTo(b, 'all', fn).stopListening(null, 'all');
        expect(_.size(a._listeningTo)).to.equal(0);
        a.listenTo(b, 'all', fn).stopListening(null, null, fn);
        expect(_.size(a._listeningTo)).to.equal(0);
    });

    it('listenTo and stopListening cleaning up references', function () {
        var a = subdivision.createEventBus();
        var b = subdivision.createEventBus();
        var cb = sinon.spy();
        a.listenTo(b, 'all', cb);
        b.trigger('anything');
        a.listenTo(b, 'other', cb);
        a.stopListening(b, 'other');
        a.stopListening(b, 'all');

        expect(_.size(a._listeningTo)).to.equal(0);
    });

    it('listenTo with empty callback doesn\'t throw an error', function () {
        var e = subdivision.createEventBus();
        e.listenTo(e, 'foo', null);
        e.trigger('foo');
    });

    it('trigger all for each event', function () {
        var a, b, obj = {counter: 0};
        obj = subdivision.createEventBus(obj);
        obj.on('all', function (event) {
            obj.counter++;
            if (event === 'a') {
                a = true;
            }
            if (event === 'b') {
                b = true;
            }
        })
            .trigger('a b');

        expect(a).to.be.true;
        expect(b).to.be.true;
        expect(obj.counter).to.equal(2);
    });

    it('on, then unbind all functions', function () {
        var obj = {counter: 0};
        obj = subdivision.createEventBus(obj);
        var callback = function () {
            obj.counter += 1;
        };
        obj.on('event', callback);
        obj.trigger('event');
        obj.off('event');
        obj.trigger('event');

        expect(obj.counter).to.equal(1, 'counter should have only been incremented once.');
    });

    it('bind two callbacks, unbind only one', function () {
        var obj = {counterA: 0, counterB: 0};
        obj = subdivision.createEventBus(obj);

        var callback = function () {
            obj.counterA += 1;
        };
        obj.on('event', callback);
        obj.on('event', function () {
            obj.counterB += 1;
        });
        obj.trigger('event');
        obj.off('event', callback);
        obj.trigger('event');

        expect(obj.counterA).to.equal(1, 'counterA should have only been incremented once.');
        expect(obj.counterB).to.equal(2, 'counterB should have been incremented twice.');
    });

    it('unbind a callback in the midst of it firing', function () {
        var obj = {counter: 0};
        obj = subdivision.createEventBus(obj);
        var callback = function () {
            obj.counter += 1;
            obj.off('event', callback);
        };
        obj.on('event', callback);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');

        expect(obj.counter).to.equal(1, 'the callback should have been unbound.');
    });

    it('two binds that unbind themeselves', function () {
        var obj = {counterA: 0, counterB: 0};
        obj = subdivision.createEventBus(obj);
        var incrA = function () {
            obj.counterA += 1;
            obj.off('event', incrA);
        };
        var incrB = function () {
            obj.counterB += 1;
            obj.off('event', incrB);
        };
        obj.on('event', incrA);
        obj.on('event', incrB);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');

        expect(obj.counterA).to.equal(1, 'counterA should have only been incremented once.');
        expect(obj.counterB).to.equal(1, 'counterB should have only been incremented once.');
    });

    it('bind a callback with a supplied context', function () {
        var TestClass = function () {
            return this;
        };
        TestClass.prototype.assertTrue = sinon.spy();

        var obj = subdivision.createEventBus();
        obj.on('event', function () {
            this.assertTrue();
        }, (new TestClass()));
        obj.trigger('event');

        expect(TestClass.prototype.assertTrue.calledOnce).to.be.true;
    });

    it('nested trigger with unbind', function () {
        var obj = {counter: 0};
        obj = subdivision.createEventBus(obj);

        var incr1 = function () {
            obj.counter += 1;
            obj.off('event', incr1);
            obj.trigger('event');
        };
        var incr2 = function () {
            obj.counter += 1;
        };
        obj.on('event', incr1);
        obj.on('event', incr2);
        obj.trigger('event');

        expect(obj.counter).to.equal(3, 'counter should have been incremented three times');
    });

    it('callback list is not altered during trigger', function () {
        var counter = 0;
        var obj = subdivision.createEventBus();

        var incr = function () {
            counter++;
        };
        obj.on('event', function () {
            obj.on('event', incr).on('all', incr);
        })
            .trigger('event');


        expect(counter).to.equal(0, 'bind does not alter callback list');

        obj.off()
            .on('event', function () {
                obj.off('event', incr).off('all', incr);
            })
            .on('event', incr)
            .on('all', incr)
            .trigger('event');

        expect(counter).to.equal(2, 'unbind does not alter callback list');
    });

    it('#1282 - \'all\' callback list is retrieved after each event.', function () {
        var counter = 0;
        var obj = subdivision.createEventBus();

        var incr = function () {
            counter++;
        };
        obj.on('x', function () {
            obj.on('y', incr).on('all', incr);
        })
            .trigger('x y');

        expect(counter).to.equal(2);
    });

    it('if no callback is provided, `on` is a noop', function () {
        subdivision.createEventBus().on('test').trigger('test');
    });

    it('if callback is truthy but not a function, `on` should throw an error just like jQuery', function () {
        var view = subdivision.createEventBus().on('test', 'noop');
        expect(function () {
            view.trigger('test');
        }).to.throw;
    });

    it('remove all events for a specific context', function () {
        var obj = subdivision.createEventBus();
        var cb = sinon.spy();
        obj.on('x y all', cb);
        obj.on('x y all', cb, obj);
        obj.off(null, null, obj);
        obj.trigger('x y');

        expect(cb.callCount).to.equal(4);
    });

    it('remove all events for a specific callback', function () {
        var obj = subdivision.createEventBus();
        var success = sinon.spy();
        var fail = sinon.spy();
        obj.on('x y all', success);
        obj.on('x y all', fail);
        obj.off(null, fail);
        obj.trigger('x y');

        expect(success.callCount).to.equal(4);
        expect(fail.callCount).to.equal(0);
    });

    it('#1310 - off does not skip consecutive events', function () {
        var obj = subdivision.createEventBus();
        var cb = sinon.spy();
        obj.on('event', cb, obj);
        obj.on('event', cb, obj);
        obj.off(null, null, obj);
        obj.trigger('event');
        expect(cb.callCount).to.equal(0);
    });

    it('once', function () {
        // Same as the previous test, but we use once rather than having to explicitly unbind
        var obj = {counterA: 0, counterB: 0};
        obj = subdivision.createEventBus(obj);

        var incrA = function () {
            obj.counterA += 1;
            obj.trigger('event');
        };
        var incrB = function () {
            obj.counterB += 1;
        };
        obj.once('event', incrA);
        obj.once('event', incrB);
        obj.trigger('event');

        expect(obj.counterA).to.equal(1, 'counterA should have only been incremented once.');
        expect(obj.counterA).to.equal(1, 'counterB should have only been incremented once.');
    });

    it('once variant one', function () {
        var f = sinon.spy();

        var a = subdivision.createEventBus().once('event', f);
        var b = subdivision.createEventBus().on('event', f);

        a.trigger('event');

        b.trigger('event');
        b.trigger('event');

        expect(f.callCount).to.equal(3);
    });

    it('once variant two', function () {
        var f = sinon.spy();
        var obj = subdivision.createEventBus();

        obj
            .once('event', f)
            .on('event', f)
            .trigger('event')
            .trigger('event');

        expect(f.callCount).to.equal(3);
    });

    it('once with off', function () {
        var f = sinon.spy();
        var obj = subdivision.createEventBus();

        obj.once('event', f);
        obj.off('event', f);
        obj.trigger('event');

        expect(f.callCount).to.equal(0);
    });

    it('once with event maps', function () {
        var obj = {counter: 0};
        obj = subdivision.createEventBus(obj);

        var increment = function () {
            this.counter += 1;
        };

        obj.once({
            a: increment,
            b: increment,
            c: increment
        }, obj);

        obj.trigger('a');
        expect(obj.counter).to.equal(1);

        obj.trigger('a b');
        expect(obj.counter).to.equal(2);

        obj.trigger('c');
        expect(obj.counter).to.equal(3);

        obj.trigger('a b c');
        expect(obj.counter).to.equal(3);
    });

    it('once with off only by context', function () {
        var context = {};
        var obj = subdivision.createEventBus();
        var cb = sinon.spy();
        obj.once('event', cb, context);
        obj.off(null, null, context);
        obj.trigger('event');

        expect(cb.called).to.be.false;
    });

    it('once with asynchronous events', function (done) {
        var callback = sinon.spy(function () {
            expect(callback.calledOnce).to.be.true;
            done();
        });

        var func = _.debounce(callback, 50);
        var obj = subdivision.createEventBus().once('async', func);

        obj.trigger('async');
        obj.trigger('async');
    });

    it('once with multiple events.', function () {
        var obj = subdivision.createEventBus();
        var callback = sinon.spy();
        obj.once('x y', callback);
        obj.trigger('x y');

        expect(callback.calledTwice).to.be.true;
    });

    it('Off during iteration with once.', function () {
        var obj = subdivision.createEventBus();
        var callback = sinon.spy();
        var f = function () {
            this.off('event', f);
        };
        obj.on('event', f);
        obj.once('event', function () {
        });
        obj.on('event', callback);

        obj.trigger('event');
        obj.trigger('event');

        expect(callback.calledTwice).to.be.true;
    });

    it('"once" on "all" should work as expected', function () {
        var obj = subdivision.createEventBus();
        var callCount = 0;

        obj.once('all', function () {
            callCount++;
            obj.trigger('all');
        });
        obj.trigger('all');

        expect(callCount).to.equal(1);
    });

    it('once without a callback is a noop', function () {
        subdivision.createEventBus().once('event').trigger('event');
    });

    it('event functions are chainable', function () {
        var obj = subdivision.createEventBus();
        var obj2 = subdivision.createEventBus();
        var fn = function () {
        };
        expect(obj).to.equal(obj.trigger('noeventssetyet'));
        expect(obj).to.equal(obj.off('noeventssetyet'));
        expect(obj).to.equal(obj.stopListening('noeventssetyet'));
        expect(obj).to.equal(obj.on('a', fn));
        expect(obj).to.equal(obj.once('c', fn));
        expect(obj).to.equal(obj.trigger('a'));
        expect(obj).to.equal(obj.listenTo(obj2, 'a', fn));
        expect(obj).to.equal(obj.listenToOnce(obj2, 'b', fn));
        expect(obj).to.equal(obj.off('a c'));
        expect(obj).to.equal(obj.stopListening(obj2, 'a'));
        expect(obj).to.equal(obj.stopListening());
    });

    it('should call events with two paramters as the arguments of the event', function () {
        var obj = subdivision.createEventBus();
        var callback = sinon.spy();
        var arg1 = {a: 0}, arg2 = {b: 1}, arg3 = {c: 1}, arg4 = {d: 1};

        obj.on('event', callback);
        obj.trigger('event', arg1, arg2);
        obj.trigger('event', arg1, arg2, arg3);
        obj.trigger('event', arg1, arg2, arg3, arg4);

        expect(callback.firstCall.args[0]).to.equal(arg1);
        expect(callback.firstCall.args[1]).to.equal(arg2);

        expect(callback.secondCall.args[0]).to.equal(arg1);
        expect(callback.secondCall.args[1]).to.equal(arg2);
        expect(callback.secondCall.args[2]).to.equal(arg3);

        expect(callback.thirdCall.args[0]).to.equal(arg1);
        expect(callback.thirdCall.args[1]).to.equal(arg2);
        expect(callback.thirdCall.args[2]).to.equal(arg3);
        expect(callback.thirdCall.args[3]).to.equal(arg4);
    });

    it('offAll should remove all the events subscribers with the same context', function () {
        var obj = subdivision.createEventBus(),
            myContext = {paramInContext: 1},
            callback1 = sinon.spy(),
            callback2 = sinon.spy(),
            callback3 = sinon.spy();

        obj.on('event1', callback1, myContext);
        obj.on('event2', callback2, myContext);
        obj.on('event3', callback3);

        obj.trigger('event1 event2 event3');
        expect(callback1.calledOnce).to.be.true;
        expect(callback2.calledOnce).to.be.true;
        expect(callback3.calledOnce).to.be.true;

        expect(callback1.calledOn(myContext)).to.be.true;
        expect(callback2.calledOn(myContext)).to.be.true;

        callback1.reset();
        callback2.reset();
        callback3.reset();
        obj.offContext(myContext);
        obj.trigger('event1 event2 event3');
        expect(callback1.called).to.be.false;
        expect(callback2.called).to.be.false;
        expect(callback3.calledOnce).to.be.true;
    });
});