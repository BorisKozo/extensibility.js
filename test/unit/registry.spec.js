describe('Registry', function () {
  'use strict';
  var expect = chai.expect;
  var EJS = window.EJS;

  afterEach(function () {
    EJS.registry.clear();
  });

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

  });

  describe('Build Path', function () {
    it('should build an empty path when called with no args', function () {
      expect(EJS.registry.buildPath()).to.be.equal('');
    });

    it('should build a path from array', function () {
      expect(EJS.registry.buildPath(['a', 'bcd', 'ef'])).to.be.equal('a/bcd/ef');
      expect(EJS.registry.buildPath(['a', ['bcd'], ['ef', 'g']])).to.be.equal('a/bcd/ef/g');
    });

    it('should build a path from arguments', function () {
      expect(EJS.registry.buildPath('a')).to.be.equal('a');
      expect(EJS.registry.buildPath('a', 'bcd', 'ef')).to.be.equal('a/bcd/ef');
    });

    it('should throw if one of the axes contains the delimiter', function () {
      expect(function () {
        EJS.registry.buildPath('a', 'b/cd', 'ef');
      }).to.throw('Illegal path axis b/cd for delimiter /');
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

  describe('Node Exists', function () {
    it('should return false for non existing nodes', function () {
      expect(EJS.registry.nodeExists('abv')).to.be.false;
      expect(EJS.registry.nodeExists('abv/aaa')).to.be.false;
    });

    it('should return true for existing nodes', function () {
      EJS.registry.addAddin('abv');
      expect(EJS.registry.nodeExists('abv')).to.be.true;

      EJS.registry.addAddin('abv/ccc/a');
      expect(EJS.registry.nodeExists('abv/ccc/a')).to.be.true;
      expect(EJS.registry.nodeExists('abv/ccc')).to.be.true;

    });
  });

  describe('Add Addin', function () {
    it('should add an addin to a specific node', function () {
      var addin = {};
      EJS.registry.addAddin('a/b/c', addin);
      expect(EJS.registry.getAddins('a/b/c')[0]).to.be.equal(addin);
    });

    it('should create a node if the addin is undefined', function () {
      
      EJS.registry.addAddin('a/b/c');
      expect(EJS.registry.nodeExists('a/b/c')).to.be.true;
    });
  });

  describe('Get Addins', function () {
    it('should not get addins of non existing node', function () {
      expect(EJS.registry.getAddins('abv/ccc/a')).to.be.null;
    });

    it('should get all addins of a node', function () {
      var addin1 = {};
      var addin2 = {};
      EJS.registry.addAddin('ab/cd', addin1);
      EJS.registry.addAddin('ab/cd', addin2);
      expect(EJS.registry.getAddins('ab/cd')).to.be.eql([addin1, addin2]);
    });

    it('should get all addins of a node with a specific property', function () {
      var addin1 = {id:1};
      var addin2 = {id:2};
      EJS.registry.addAddin('ab/cd', addin1);
      EJS.registry.addAddin('ab/cd', addin2);
      expect(EJS.registry.getAddins('ab/cd', { id: 1 })).to.be.eql([addin1]);
    });

  });

  describe('Clear', function () {
    it('should clear the registry', function () {
      expect(EJS.registry.nodeExists('aaa')).to.be.false;
      EJS.registry.addAddin('aaa');
      expect(EJS.registry.nodeExists('aaa')).to.be.true;
      EJS.registry.clear();
      expect(EJS.registry.nodeExists('aaa')).to.be.false;
    });
  });


});
