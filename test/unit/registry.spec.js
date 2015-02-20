describe('Registry', function () {
  'use strict';
  var expect = chai.expect;
  var EJS = window.EJS;

  afterEach(function () {
    EJS.registry.$clear();
  });

  describe('Verify Axis', function () {

    it('should return false if axis is null, undefined, number, etc', function () {
      expect(EJS.registry.verifyAxis(null)).to.be.false;
      expect(EJS.registry.verifyAxis(undefined)).to.be.false;
      expect(EJS.registry.verifyAxis(10)).to.be.false;
      expect(EJS.registry.verifyAxis(true)).to.be.false;
    });

    it('should return false if axis an empty string', function () {
      expect(EJS.registry.verifyAxis('')).to.be.false;
    });

    it('should return false if axis contains the delimiter', function () {
      expect(EJS.registry.verifyAxis('Hello/world')).to.be.false;
      expect(EJS.registry.verifyAxis('/d')).to.be.false;
      expect(EJS.registry.verifyAxis('/')).to.be.false;
    });

    it('should return true for a valid axis', function () {
      expect(EJS.registry.verifyAxis('Hello world')).to.be.true;
    });

  });

  describe('Join Path', function () {
    it('should build an empty path when called with no args', function () {
      expect(EJS.registry.joinPath()).to.be.equal('');
    });

    it('should build a path from array', function () {
      expect(EJS.registry.joinPath(['a', 'bcd', 'ef'])).to.be.equal('a/bcd/ef');
      expect(EJS.registry.joinPath(['a', ['bcd'], ['ef', 'g']])).to.be.equal('a/bcd/ef/g');
    });

    it('should build a path from arguments', function () {
      expect(EJS.registry.joinPath('a')).to.be.equal('a');
      expect(EJS.registry.joinPath('a', 'bcd', 'ef')).to.be.equal('a/bcd/ef');
    });

    it('should build a path with multiple paths as arguments', function(){
      expect(EJS.registry.joinPath('a/bcd', 'ef')).to.be.equal('a/bcd/ef');
      expect(EJS.registry.joinPath('a/bcd', 'ef/g')).to.be.equal('a/bcd/ef/g');
      expect(EJS.registry.joinPath('a', 'ef/g')).to.be.equal('a/ef/g');
      expect(EJS.registry.joinPath('', 'ef/g')).to.be.equal('ef/g');
      expect(EJS.registry.joinPath('ef/g','')).to.be.equal('ef/g');
    });

    it('should return an empty path if all the arguments are empty', function(){
      expect(EJS.registry.joinPath('','')).to.be.equal('');
    });

  });

  describe('Break Path', function () {
    it('should throw if the path is not a string', function () {
      expect(function () {
        EJS.registry.breakPath({});
      }).to.throw('path must be a string {}');

    });

    it('should throw if the path contains empty axes', function () {
      expect(function () {
        EJS.registry.breakPath('/a/b/c');
      }).to.throw('Invalid axis ');
      expect(function () {
        EJS.registry.breakPath('a/b/c/');
      }).to.throw('Invalid axis ');

    });

    it('should break an empty path', function () {
      expect(EJS.registry.breakPath('')).to.be.eql([]);
    });

    it('should break a path', function () {
      expect(EJS.registry.breakPath('abv')).to.be.eql(['abv']);
      expect(EJS.registry.breakPath('abv/efg/aaa')).to.be.eql(['abv', 'efg', 'aaa']);
    });
  });

  describe('Path Exists', function () {
    it('should return false for non existing nodes', function () {
      expect(EJS.registry.pathExists('abv')).to.be.false;
      expect(EJS.registry.pathExists('abv/aaa')).to.be.false;
    });

    it('should return true for existing nodes', function () {
      EJS.addAddin('abv');
      expect(EJS.registry.pathExists('abv')).to.be.true;

      EJS.addAddin('abv/ccc/a');
      expect(EJS.registry.pathExists('abv/ccc/a')).to.be.true;
      expect(EJS.registry.pathExists('abv/ccc')).to.be.true;

    });
  });

  describe('Clear', function () {
    it('should clear the registry', function () {
      expect(EJS.registry.pathExists('aaa')).to.be.false;
      EJS.addAddin('aaa');
      expect(EJS.registry.pathExists('aaa')).to.be.true;
      EJS.registry.$clear();
      expect(EJS.registry.pathExists('aaa')).to.be.false;
    });
  });

});
