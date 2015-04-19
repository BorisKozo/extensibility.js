Extensibility - A simple extensibility layer for your JavaScript application
==========================================
[![Build Status](https://travis-ci.org/BorisKozo/extensibility.js.png?branch=master)](https://travis-ci.org/BorisKozo/extensibility.js)

This library is a collection of simple patterns that can help you manage the modularization and decoupling of your
 application components. It is conceptually based on the SharpDevelop addin tree and is built with the
 "turtles all the way down" methodology (i.e. each concept is using the previous concepts of the library).
 This library is **not** a replacement for Backbone/Ember/Angular/Knockout/<your framework> as it provides complementary
 features that can integrate with these frameworks and in general it is designed to play well with others.

 If you have any suggestions, improvements or ideas for this library I would be more than happy to hear them and integrate them.

## Documentation

This readme file contains basic usage examples and
details on the full API, including methods,
attributes and helper functions.
To use the library, include  ````dist/extensibility.js```` or ````dist/extensibility.min.js```` in your
index.html.

The library has two dependencies - lodash and Promise polyfill for browsers that do not support ES6 Promise function.
It should be possible to load this library using AMD or Common.js loaders and in Node.js as long as the dependencies are provided.

Some objects contain private function denoted with prefixed ```$``` sign. You should not normally call these functions.
Changes made to the signature or the return value of these function does not constitute a breaking API change.

## The Registry

The center of this library is the registry. The registry is basically a tree. Each node in the tree has a string name
and it contains an array of items. We refer to these items as _addins_ (SharpDevelop: codons), more on addins in
a following section. Since every node in the tree may contain addins, each node has a _path_ within the tree.
The path contains the names of the nodes in the order they must be traversed to reach the desired node. For example,
to reach a node with the name ```foo``` which is a direct child of the node ```boo``` which is a direct child
of the tree root, we need to use the path ```boo/foo```. The root node is denoted by the empty string so the path
```/boo/foo``` is also correct. The path delimiter is ```/``` and it is (currently) hardcoded. The registry is a global
singleton.

The Registry API is encapsulated within the ```EJS.registry``` object and is as follows:

#### EJS.registry.$getNode(axes, createIfNotExists) -> node
Tries to get a tree node from the registry tree based on the given _axes_. _axes_ can be a valid path string or
an array of node names. If the requested node or any of the nodes in the path to the requested node do not exist,
creates the node based on the _createIfNotExists_ argument. If the requested node is not found ```null``` is returned.

```js
var newNode = EJS.registry.$getNode(['foo','boo'],true);

//creates the node foo under the root node and the node boo
//under the foo node. The last node (i.e. boo) is returned

console.log(newNode === EJS.registry.$getNode('foo/boo', false)) // true
```

#### EJS.registry.$clear()
Forcefully removes all the nodes and their content from the registry. You should never call this function unless you
are absolutley sure you know what you are doing.

#### EJS.registry.verifyAxis(axis) -> boolean
Determines if the given axis is a valid axis name for the registry (i.e. can be used as a node name). The axis should be
a non empty string which does not contain the delimiter.

```js
  EJS.registry.verifyAxis(null); //false
  EJS.registry.verifyAxis(undefined); //false
  EJS.registry.verifyAxis(10); //false
  EJS.registry.verifyAxis(''); //false
  EJS.registry.verifyAxis('foo'); //true
  EJS.registry.verifyAxis('foo/boo'); //false
  EJS.registry.verifyAxis('You can put almost any string here'); //true
```

#### EJS.registry.joinPath(<axes|paths>) -> path
Creates a single path out of the given _axes_ or _paths_. The axes or paths can be any number of separate strings
or an array containing strings up to any depth. The proper delimiter is automatically added between the
axes and paths as the path is built.

```js
  EJS.registry.joinPath('a', 'bcd', 'ef'); // 'a/bcd/ef'
  EJS.registry.joinPath('a/bcd', 'ef/g');  //'a/bcd/ef/g');
  EJS.registry.joinPath(['a', ['bcd'], ['ef', 'g']]); //'a/bcd/ef/g';
```


#### EJS.registry.breakPath(path) -> [axes]
Breaks the given path to its individual axes. Returns an array containing all the axes as strings.

```js
  EJS.registry.breakPath('abv/efg/aaa'); //['abv', 'efg', 'aaa']
```

#### EJS.registry.pathExists(path) -> boolean
Returns true if the tree node for the given path exists in the tree. Note that when you create a node at some path,
all the nodes along the path are also created. For example if you insert into the path a/b/c then a, a/b, and a/b/c
will be created.

```js
 EJS.registry.$getNode(['foo','boo'],true);
 EJS.registry.pathExists('foo'); //true
 EJS.registry.pathExists('foo/boo'); //true
 EJS.registry.pathExists('boo'); //false
```

## Addins
The registry can contain anything in its nodes but it main purpose is to hold addins. "Addin" is just a fancy name
for a JavaScript object that has certain properties. In fact, anything this library adds for you into the registry is
 an addin.

#### EJS.Addin(options) -> Addin (The Addin constructor)
Creates a new addin and shallow copies all the properties from _options_ onto it. If _options_ is a function, shallow
copies all the properties from the object returned by the function. An addin contains at least two properties:

 * **id** - A unique string that identifies this addin within a path in the registry. Note that two addins may have the
  same id if they are added into different paths in the registry.

 * **order** - A valid order operator (more on ordering addins in the next section).


```js
  var myAddin = new EJS.Addin({myVar:1, myString:"aaa", order:123});
  //an id will be auto generated

  console.log(myAddin); // {id:"addin0", myVar:1, myString:"aaa", order:123}
  var myOtherAddin = new EJS.Addin(function(){
    return {id:"myId"};
  });
  console.log(myOtherAddin); //{id:"myId", order:0}
```

#### EJS.addAddin(path, addin)
Adds the given _addin_ to the given _path_ in the registry. There is no check that the _addin_ was constructed with the
````EJS.Addin```` constructor so you can send any object there as long as it has the appropriate signature.

#### EJS.getAddins(path, searchCriteria, skipSort) -> [Addin]
Returns an array containing all the addins in the given _path_ that match the _searchCriteria_. If _searchCriteria_ is
````undefined````, returns all the addins in the path. Set _skipSort_ to true if you don't want to sort the returned addins by
order (more on ordering addins in the next section). The syntax for the _searchCriteria_ is determined by the lodash
[filter function](https://lodash.com/docs#filter) as the _predicate_ argument.

```js
  EJS.addAddin('aaa',new EJS.Addin({name:"Bob"}));
  EJS.addAddin('aaa',new EJS.Addin({name:"Alice"}));
  EJS.getAddins('aaa'); //[{name:"Bob" ...},{name:"Alice" ...}]
  EJS.getAddins('aaa',{name:"Alice"}); //[{name:"Alice" ...}]
  EJS.getAddins('aaa',function(addin){
    return addin.name === "Alice";
  }); //[{name:"Alice" ...}]
```

## Topological Sort
For each addin that goes into the registry we define an ````order```` property. This field is used to sort the addins within
a given path. The values for the ````order```` property can be one of the following:

* Number - The absolute order of the addin, during the sort addins with lower number order will appear first.

* ">>id" - (After) The addin with this order must be somewhere after the addin with the given _id_. For example ">>foo" means
  that the addin with this order value will be after the addin with id === "foo".

* ">id" - (Immediately after) The addin with this order must be immediately after the addin with the given _id_. For example ">foo" means
               that the addin with this order value will be immediately after the addin with id === "foo".

* "<<id" - (Before) The addin with this order must be somewhere before the addin with the given _id_. For example "<<foo" means
  that the addin with this order value will be before the addin with id === "foo".

* "<id" - (Immediately before) The addin with this order must be immediately before the addin with the given _id_. For example "<foo" means
               that the addin with this order value will be immediately before the addin with id === "foo".

It is possible to mix the non absolute values by creating a comma separated list. This list must contain at most one "Immediately" order
and this order must appear last. For example "<<foo,>>bar,>moo" is valid while "<<foo,>moo,>>bar" is not.

The order is evaluated in priority, first the immediately orders are calculated then the non immediate and the absolute are calculated last.

#### EJS.utils.topologicalSort(addins) -> [addins]
Sorts the given array of _addins_ with the rules mentioned above. Returns a copy of the array with all the addins sorted (does not change the original array).
Note: You should probably never call this yourself, this function is used internally to retrieve addins.

```js
            var addins = [];
            addins.push(new EJS.Addin({id: '1', order: 10}));
            addins.push(new EJS.Addin({id: '2', order: 0}));
            addins.push(new EJS.Addin({id: '3', order: 20}));
            addins.push(new EJS.Addin({id: '4', order: 30}));
            addins.push(new EJS.Addin({id: '5', order: 25}));
            var result = EJS.utils.topologicalSort(addins);
            //[{id:2},{id:1},{id:3},{id:5},{id:4}]
```

```js
            var addins = [];
            addins.push(new EJS.Addin({id: '1', order: 0}));
            addins.push(new EJS.Addin({id: '2', order: '<<3,<1'}));
            addins.push(new EJS.Addin({id: '3', order: 20}));
            addins.push(new EJS.Addin({id: '4', order: '>>2,>3'}));
            var result = EJS.utils.topologicalSort(addins);
            //[{id:2},{id:1},{id:3},{id:4}]
```


## Builders
An addin can be anything including a metadata for creating an actual object. The builders are used to transform
  an adding to another object or value by processing the addin content. Each addin may habe a ````type````
  property which tells the library which builder is assigned to build that addin.

#### Builders path in the registry
 ````
 EJS.systemPaths.builders
 ````

#### The default builder
The default builder is added to the registry (via the default manifest, see details below) with the following
definition

```js
 {
                id: 'EJS.defaultBuilder',
                type: 'EJS.builder',
                target: null,
                order: 100,
                build: function (addin) {
                    return _.cloneDeep(addin);
                }
            }
```

#### EJS.Builder(options) -> Builder (The builder constructor)
Creates a new Builder from the given _options_. A builder is a type of addin therefore the addin constructor
 is called for the builder with the given _options_. A builder must have one function called _build(addin)_ which
 takes an addin definition and returns anything. The builder should have a _type_ property which defines the type of
 addin this builder can build. If the _type_ of a builder is ````null```` then the builder is the default builder for
 all addin types. You may manipulate the builders order within the registry by using the _order_ property of the builder
 addin.

 ```js
   //Create a builder that can build addins of type monkey
   var builder = new EJS.Builder({
                 id: 'abc',
                 order: 3,
                 type: 'monkey',
                 build: function (addin) {
                     return {
                        food: addin.food
                     };
                 }
             });
 ```

#### EJS.addBuilder(options, force) -> Boolean
Creates and adds a new builder based on the provided _options_ (see builder constructor). If a builder for the given
target already exists then it is replaced with the new builder only if _force_ is truthy. Returns true if a builder was
added and false otherwise. To add a default builder use ````target = null```` in the provided _options_.

```js
            var options = {
                id: 'abc',
                order: 3,
                target: 'monkey',
                build: function () {
                }
            };

            EJS.addBuilder(options);
            var builder = EJS.getBuilder('monkey'); //returns the builder with id 'abc'
```

#### EJS.getBuilder(type) -> Builder
Returns a builder for the given _type_ or the default builder if a builder with the given _type_ was not registered.
Pass ''''null'''' as the argument to get the default builder. If no builder is found for the given _type_ and there is no
default builder defined then an exception is thrown.

```js
            var options = {
                id: 'hello',
                target: null,
                build: function () {
                }
            };

            EJS.addBuilder(options, true); //Replace the default builder with a new one
            var builder = EJS.getBuilder(null);
            var builder2 = EJS.getBuilder('no such type');
            console.log(builder === builder2); //true
```

#### EJS.build(path, searchCriteria, skipSort)-> Array
Builds all the addins in the given _path_ by calling the build function for each addin separately based on its type.
If _searchCriteria_ is specified the syntax for the is determined by the lodash
[filter function](https://lodash.com/docs#filter) as the _predicate_ argument.
Set _skipSort_ to true if you don't want to sort the returned addins by order.

```js
            EJS.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin) {
                    return addin.id;
                }
            });

            EJS.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            EJS.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            var items = EJS.build('aaa'); //['1','2']
```

#### EJS.build.async(path, searchCriteria, skipSort)-> Promise
Same as ````EJS.build```` but returns a Promise that resolves with the result array. Does not assume that any of the
builders involved in building the given _path_ are asynchronous. Use this variant if any of the builders for the
_path_ are asynchronous.

#### EJS.buildTree(path)-> Array
Builds all the addins in the given _path_ by calling the build function for each addin separately based on its type but also
builds all the sub-paths of the given path. When an addin of a sub path is built it is added to the items property of the
parent addin identified by the addin id. For example, if in the path "aaa" there is an addin with id "myId" and in the path
"aaa/myId" there is an addin with id "innerAddinId" then the result of building a tree on the path "aaa" with this
function is the built addin "myId" and in its items property is the built addin "innerAddinId" (see example below).
The default items property is ````$items```` but it can be changed by specifying the ````itemsProperty```` property on
the addin definition.

```js
            EJS.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin) {
                    return {id: addin.id};
                }
            });

            EJS.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            EJS.addAddin('aaa', {id: '2', type: 'monkey', order: 2});
            EJS.addAddin('aaa', {id: '3', type: 'monkey', order: 3, itemsProperty: 'stuff'});
            EJS.addAddin(EJS.registry.joinPath('aaa', '2'), {id: '1', type: 'monkey', order: 2});
            EJS.addAddin(EJS.registry.joinPath('aaa', '2'), {id: '2', type: 'monkey', order: 3});
            EJS.addAddin(EJS.registry.joinPath('aaa', '3'), {id: '1', type: 'monkey', order: 3});

            var items = EJS.buildTree('aaa');
            // [{
            //      id:'1',
            //      $items:[{id:'1'},{id:'2'}]
            //  },
            //  {
            //      id:'2'
            //  },
            //  {
            //      id:'3',
            //      stuff:[{id:'1'}]
            //  }]
```

## Unit Tests

1. Be sure you have NodeJS and NPM installed on your system

2. Run `npm install` to install Karma and Mocha

3. From the project folder, run `npm run-script test1` to execute the unit tests

## Building

1. Run `grunt build`

If all went well, the appropriate files should be generated in the dist directory

##License
(MIT License)
Copyright (c) 2014 Boris Kozorovitzky, 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


