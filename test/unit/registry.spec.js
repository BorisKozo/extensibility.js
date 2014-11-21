describe('Registry', function () {
  'use strict';
  var expect = chai.expect;


  describe('Verify Axis', function () {

    it('should return false if axis is null, undefined, number, etc', function () {
      expect(EJS.registry.verifyAxis(null, '/')).to.be.false;
      expect(EJS.registry.verifyAxis(undefined, '/')).to.be.false;
      expect(EJS.registry.verifyAxis(10, '/')).to.be.false;
      expect(EJS.registry.verifyAxis(true, '/')).to.be.false;
    });

    it('should return false if axis an empty string', function () {
      expect(EJS.registry.verifyAxis('', '/')).to.be.false;
    });

    it('should return false if axis contains the delimiter', function () {
      expect(EJS.registry.verifyAxis('Hello/world', '/')).to.be.false;
      expect(EJS.registry.verifyAxis('/d', '/')).to.be.false;
      expect(EJS.registry.verifyAxis('/', '/')).to.be.false;
    });

    it('should return true for a valid axis', function () {
      expect(EJS.registry.verifyAxis('Hello world', '/')).to.be.true;
    });

  })

  describe('Build Path', function () {
    it('should build an empty path when called with no args', function () {
      expect(EJS.registry.buildPath()).to.be.equal('/');
    });

    it('should build a path from array', function () {
      expect(EJS.registry.buildPath(['a', 'bcd', 'ef'])).to.be.equal('/a/bcd/ef');
      expect(EJS.registry.buildPath(['a', ['bcd'], ['ef','g']])).to.be.equal('/a/bcd/ef/g');
    });

    it('should build a path from arguments', function () {
      expect(EJS.registry.buildPath('a', 'bcd', 'ef')).to.be.equal('/a/bcd/ef');
    });
  });

});
