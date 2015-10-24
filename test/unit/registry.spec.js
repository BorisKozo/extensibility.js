describe('Registry', function () {
  'use strict';
  var expect = chai.expect;
  var subdivision = window.subdivision;

  afterEach(function () {
    subdivision.registry.$clear();
  });

  describe('Verify Axis', function () {

    it('should return false if axis is null, undefined, number, etc', function () {
      expect(subdivision.registry.verifyAxis(null)).to.be.false;
      expect(subdivision.registry.verifyAxis(undefined)).to.be.false;
      expect(subdivision.registry.verifyAxis(10)).to.be.false;
      expect(subdivision.registry.verifyAxis(true)).to.be.false;
    });

    it('should return false if axis an empty string', function () {
      expect(subdivision.registry.verifyAxis('')).to.be.false;
    });

    it('should return false if axis contains the delimiter', function () {
      expect(subdivision.registry.verifyAxis('Hello/world')).to.be.false;
      expect(subdivision.registry.verifyAxis('/d')).to.be.false;
      expect(subdivision.registry.verifyAxis('/')).to.be.false;
    });

    it('should return true for a valid axis', function () {
      expect(subdivision.registry.verifyAxis('Hello world')).to.be.true;
    });

  });

  describe('Join Path', function () {
    it('should build an empty path when called with no args', function () {
      expect(subdivision.registry.joinPath()).to.be.equal('');
    });

    it('should build a path from array', function () {
      expect(subdivision.registry.joinPath(['a', 'bcd', 'ef'])).to.be.equal('a/bcd/ef');
      expect(subdivision.registry.joinPath(['a', ['bcd'], ['ef', 'g']])).to.be.equal('a/bcd/ef/g');
    });

    it('should build a path from arguments', function () {
      expect(subdivision.registry.joinPath('a')).to.be.equal('a');
      expect(subdivision.registry.joinPath('a', 'bcd', 'ef')).to.be.equal('a/bcd/ef');
    });

    it('should build a path with multiple paths as arguments', function(){
      expect(subdivision.registry.joinPath('a/bcd', 'ef')).to.be.equal('a/bcd/ef');
      expect(subdivision.registry.joinPath('a/bcd', 'ef/g')).to.be.equal('a/bcd/ef/g');
      expect(subdivision.registry.joinPath('a', 'ef/g')).to.be.equal('a/ef/g');
      expect(subdivision.registry.joinPath('', 'ef/g')).to.be.equal('ef/g');
      expect(subdivision.registry.joinPath('ef/g','')).to.be.equal('ef/g');
    });

    it('should return an empty path if all the arguments are empty', function(){
      expect(subdivision.registry.joinPath('','')).to.be.equal('');
    });

  });

  describe('Break Path', function () {
    it('should throw if the path is not a string', function () {
      expect(function () {
        subdivision.registry.breakPath({});
      }).to.throw('path must be a string {}');

    });

    it('should throw if the path contains empty axes', function () {
      expect(function () {
        subdivision.registry.breakPath('/a/b/c');
      }).to.throw('Invalid axis ');
      expect(function () {
        subdivision.registry.breakPath('a/b/c/');
      }).to.throw('Invalid axis ');

    });

    it('should break an empty path', function () {
      expect(subdivision.registry.breakPath('')).to.be.eql([]);
    });

    it('should break a path', function () {
      expect(subdivision.registry.breakPath('abv')).to.be.eql(['abv']);
      expect(subdivision.registry.breakPath('abv/efg/aaa')).to.be.eql(['abv', 'efg', 'aaa']);
    });
  });

  describe('Path Exists', function () {
    it('should return false for non existing nodes', function () {
      expect(subdivision.registry.pathExists('abv')).to.be.false;
      expect(subdivision.registry.pathExists('abv/aaa')).to.be.false;
    });

    it('should return true for existing nodes', function () {
      subdivision.addAddin('abv');
      expect(subdivision.registry.pathExists('abv')).to.be.true;

      subdivision.addAddin('abv/ccc/a');
      expect(subdivision.registry.pathExists('abv/ccc/a')).to.be.true;
      expect(subdivision.registry.pathExists('abv/ccc')).to.be.true;

    });
  });

  describe('Sub Paths', function () {
    it('should return all the subpaths of a given node', function () {
      subdivision.addAddin('abv/ccc/a');
      subdivision.addAddin('abv/ccc/b');
      subdivision.addAddin('abv/ccc/c');
      var subpaths = subdivision.registry.getSubPaths('abv/ccc');
      expect(subpaths).to.be.ok;
      expect(subpaths.length).to.be.equal(3);
      expect(subpaths.indexOf('a')).to.not.be.equal(-1);
      expect(subpaths.indexOf('b')).to.not.be.equal(-1);
      expect(subpaths.indexOf('c')).to.not.be.equal(-1);
    });

    it('should return null for non existing path', function () {
      var subpaths = subdivision.registry.getSubPaths('abv/ccc');
      expect(subpaths).to.be.null;
    });
  });

  describe('Clear', function () {
    it('should clear the registry', function () {
      expect(subdivision.registry.pathExists('aaa')).to.be.false;
      subdivision.addAddin('aaa');
      expect(subdivision.registry.pathExists('aaa')).to.be.true;
      subdivision.registry.$clear();
      expect(subdivision.registry.pathExists('aaa')).to.be.false;
    });
  });

});
