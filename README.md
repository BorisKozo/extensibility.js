subdivision - A simple library for building highly decoupled and modular web applications.
==========================================
[![Build Status](https://travis-ci.org/BorisKozo/subdivision.png?branch=master)](https://travis-ci.org/BorisKozo/subdivision)

This library is a collection of simple patterns that help web developers manage the modularization and decoupling of your
 application components. It is conceptually based on the SharpDevelop addin tree and is built with the
 "turtles all the way down" methodology (i.e. each concept is using the previous concepts of the library).
 This library is **not** a replacement for Backbone/Ember/Angular/Knockout/React/<your framework> as it provides complementary
 features that can integrate with these frameworks and in general it is designed to play well with others.

 If you have any suggestions, improvements or ideas for this library I would be more than happy to hear them and integrate them.

## Using

#### Node.js

````
npm install subdivision --save
````

Then 

````var subdivision = require('subdivision');````

#### Browser

Include  ````dist/subdivision.js```` or ````dist/subdivision.min.js```` in your html.

## Documentation

This readme file contains basic usage examples and
details on the full API, including methods,
attributes and helper functions.




The library has two dependencies - lodash and Promise polyfill for browsers that do not support ES6 Promise function.
It should be possible to load this library using AMD or Common.js loaders and in Node.js as long as the dependencies are provided.

Some objects contain private function denoted with prefixed ```$``` sign. You should not normally call these functions.
Changes made to the signature or the return value of these function does not constitute a breaking API change.

In Node.js you can get the current version of subdivision by calling ````subdivision.$version````. This is also the package
version on NPM.

## The Registry

The center of this library is the registry. The registry is basically a tree. Each node in the tree has a string name
and it contains an array of items. We refer to these items as _addins_ (SharpDevelop: codons), more on addins in
a following section. Since every node in the tree may contain addins, each node has a _path_ within the tree.
The path contains the names of the nodes in the order they must be traversed to reach the desired node. For example,
to reach a node with the name ```foo``` which is a direct child of the node ```boo``` which is a direct child
of the tree root, we need to use the path ```boo/foo```. The root node is denoted by the empty string so the path
```/boo/foo``` is also correct. The path delimiter is ```/``` and it is (currently) hardcoded. The registry is a global
singleton.

The Registry API is encapsulated within the ```subdivision.registry``` object and is as follows:
#### subdivision.registry.$defaultOrder
The default order given to all addins which don't have the ````order```` property specified. 

Defaults to 100.

#### subdivision.registry.$getNode(axes, createIfNotExists) -> node
Tries to get a tree node from the registry tree based on the given _axes_. _axes_ can be a valid path string or
an array of node names. If the requested node or any of the nodes in the path to the requested node do not exist,
creates the node based on the _createIfNotExists_ argument. If the requested node is not found ```null``` is returned.

```js
var newNode = subdivision.registry.$getNode(['foo','boo'],true);

//creates the node foo under the root node and the node boo
//under the foo node. The last node (i.e. boo) is returned

console.log(newNode === subdivision.registry.$getNode('foo/boo', false)) // true
```

#### subdivision.registry.$clear()
Forcefully removes all the nodes and their content from the registry. You should never call this function unless you
are absolutely sure you know what you are doing.

#### subdivision.registry.verifyAxis(axis) -> boolean
Determines if the given axis is a valid axis name for the registry (i.e. can be used as a node name). The axis should be
a non empty string which does not contain the delimiter.

```js
  subdivision.registry.verifyAxis(null); //false
  subdivision.registry.verifyAxis(undefined); //false
  subdivision.registry.verifyAxis(10); //false
  subdivision.registry.verifyAxis(''); //false
  subdivision.registry.verifyAxis('foo'); //true
  subdivision.registry.verifyAxis('foo/boo'); //false
  subdivision.registry.verifyAxis('You can put almost any string here'); //true
```

#### subdivision.registry.joinPath(<axes|paths>) -> path
Creates a single path out of the given _axes_ or _paths_. The axes or paths can be any number of separate strings
or an array containing strings up to any depth. The proper delimiter is automatically added between the
axes and paths as the path is built.

```js
  subdivision.registry.joinPath('a', 'bcd', 'ef'); // 'a/bcd/ef'
  subdivision.registry.joinPath('a/bcd', 'ef/g');  //'a/bcd/ef/g');
  subdivision.registry.joinPath(['a', ['bcd'], ['ef', 'g']]); //'a/bcd/ef/g';
```


#### subdivision.registry.breakPath(path) -> [axes]
Breaks the given path to its individual axes. Returns an array containing all the axes as strings.

```js
  subdivision.registry.breakPath('abv/efg/aaa'); //['abv', 'efg', 'aaa']
```

#### subdivision.registry.pathExists(path) -> boolean
Returns true if the tree node for the given path exists in the tree. Note that when you create a node at some path,
all the nodes along the path are also created. For example if you insert into the path a/b/c then a, a/b, and a/b/c
will be created.

```js
 subdivision.registry.$getNode(['foo','boo'],true);
 subdivision.registry.pathExists('foo'); //true
 subdivision.registry.pathExists('foo/boo'); //true
 subdivision.registry.pathExists('boo'); //false
```

#### subdivision.registry.getSubPaths(path) -> Array
Returns a list of all the immediate subpaths of the given path. For example if the registry contains the paths: a/b/c,
a/b/d, a/b/e then calling this function with the path a/b will return ['c','d','e'] (the order is not guaranteed).
If the path doesn't exist then null is returned.

```js
 subdivision.addAddin('a/b/c');
 subdivision.addAddin('a/b/d');
 subdivision.addAddin('a/b/e');
 subdivision.registry.getSubPaths('a/b'); //['c','d','e']
 subdivision.registry.getSubPaths('x/y'); //null
```

## Addins
The registry can contain anything in its nodes but it main purpose is to hold addins. "Addin" is just a fancy name
for a JavaScript object that has certain properties. In fact, anything this library adds for you into the registry is
 an addin.

#### subdivision.Addin(options) -> Addin (The Addin constructor)
Creates a new addin and shallow copies all the properties from _options_ onto it. If _options_ is a function, shallow
copies all the properties from the object returned by the function. An addin contains at least two properties:

 * **id** - A unique string that identifies this addin within a path in the registry. Note that two addins may have the
  same id if they are added into different paths in the registry.

 * **order** - A valid order operator (more on ordering addins in the next section).


```js
  var myAddin = new subdivision.Addin({myVar:1, myString:"aaa", order:123});
  //an id will be auto generated

  console.log(myAddin); // {id:"addin0", myVar:1, myString:"aaa", order:123}
  var myOtherAddin = new subdivision.Addin(function(){
    return {id:"myId"};
  });
  console.log(myOtherAddin); //{id:"myId", order:0}
```

#### subdivision.addAddin(path, addin)
Adds the given _addin_ to the given _path_ in the registry. There is no check that the _addin_ was constructed with the
````subdivision.Addin```` constructor so you can send any object there as long as it has the appropriate signature.

#### subdivision.getAddins(path, searchCriteria, skipSort) -> [Addin]
Returns an array containing all the addins in the given _path_ that match the _searchCriteria_. If _searchCriteria_ is
````undefined````, returns all the addins in the path. Set _skipSort_ to true if you don't want to sort the returned addins by
order (more on ordering addins in the next section). The syntax for the _searchCriteria_ is determined by the lodash
[filter function](https://lodash.com/docs#filter) as the _predicate_ argument.

```js
  subdivision.addAddin('aaa',new subdivision.Addin({name:"Bob"}));
  subdivision.addAddin('aaa',new subdivision.Addin({name:"Alice"}));
  subdivision.getAddins('aaa'); //[{name:"Bob" ...},{name:"Alice" ...}]
  subdivision.getAddins('aaa',{name:"Alice"}); //[{name:"Alice" ...}]
  subdivision.getAddins('aaa',function(addin){
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

#### subdivision.utils.topologicalSort(addins) -> [addins]
Sorts the given array of _addins_ with the rules mentioned above. Returns a copy of the array with all the addins sorted (does not change the original array).
Note: You should probably never call this yourself, this function is used internally to retrieve addins.

```js
            var addins = [];
            addins.push(new subdivision.Addin({id: '1', order: 10}));
            addins.push(new subdivision.Addin({id: '2', order: 0}));
            addins.push(new subdivision.Addin({id: '3', order: 20}));
            addins.push(new subdivision.Addin({id: '4', order: 30}));
            addins.push(new subdivision.Addin({id: '5', order: 25}));
            var result = subdivision.utils.topologicalSort(addins);
            //[{id:2},{id:1},{id:3},{id:5},{id:4}]
```

```js
            var addins = [];
            addins.push(new subdivision.Addin({id: '1', order: 0}));
            addins.push(new subdivision.Addin({id: '2', order: '<<3,<1'}));
            addins.push(new subdivision.Addin({id: '3', order: 20}));
            addins.push(new subdivision.Addin({id: '4', order: '>>2,>3'}));
            var result = subdivision.utils.topologicalSort(addins);
            //[{id:2},{id:1},{id:3},{id:4}]
```

## Manifest (and manifest-reader)
The manifest is a declarative way to define addins via a simple JavaScript object (or JSON).
 The manifest has the following structure:

```js
var myManifest : {
  paths:[
    {
       path: 'some/path/to/my/addins',
       addins: [
                {
                  target:'my.addin.target',
                  id:'addinId',
                  order: 123
                  //any other properties your addin needs
                },
                {
                  target:'my.addin.target',
                  id:'addinId2',
                  order: '<addinId'
                  //any other properties your addin needs
                }
               ]
    },
    {
       path: 'some/other/path',
       addins: [
                {
                  target:'my.target',
                  id:'addinId',
                  order: 123
                  //any other properties your addin needs
                },
                {
                  target:'my.target',
                  id:'addinId2',
                  order: 345
                  //any other properties your addin needs
                }
               ]
    }
    //etc...
  ]
}
```

The same path may appear more than once in a single manifest, the manifest reader will
join all the addins for a certain path. The only limitation is that the ids
within a given path are unique.

#### subdivision.readManifest(manifest)
Adds all the addins within the given _manifest_ into the registry.

#### subdivision.readManifestFiles.async(globPattern, globOptions)->Promise [This function is available in the Node.js version]
Reads all the files given by the standard _globPattern_ and _globOptions_ (see [glob](https://www.npmjs.com/package/glob)).
Each of the read files is loaded into the registry and therefore should export a valid manifest.

```js
subdivision.readManifestFiles.async(path.join(__dirname,'modules','**','manifest.js')).then(function(){
  return subdivision.start();
}).then(function(){
   //You are ready to run your application
});
```

#### subdivision.readManifestFiles(globPattern, globOptions) [This function is available in the Node.js version]
The synchronous version of ````subdivision.readManifestFiles````.


## Builders
An addin can be anything including a metadata for creating an actual object. The builders are used to transform
  an adding to another object or value by processing the addin content. Each addin may have a ````type````
  property which tells the library which builder is assigned to build that addin.

#### Builders path in the registry
 In the code
 ```js
 subdivision.systemPaths.builders
 ```

 In the manifest
 ```js
 subdivision/builders
 ```

#### Destructuring friendly property

```js
const {myBuilder1, myBuilder2} = subdivision.builders; //Those are builder names
```


#### The default builder
The default builder is added to the registry (via the default manifest, see details below) with the following
definition

```js
 {
                id: 'subdivision.defaultBuilder',
                type: 'subdivision.builder',
                target: null,
                order: 100,
                build: function (addin) {
                    return _.cloneDeep(addin);
                }
            }
```

#### subdivision.Builder(options) -> Builder (The builder constructor)
Creates a new Builder from the given _options_. A builder is a type of addin therefore the addin constructor
 is called for the builder with the given _options_. A builder must have one function called _build(addin, options, meta)_ which
 takes an addin definition, the options passed to the _build_ function by the caller, and some metadata generated by the library.
 The _build_ function may return anything based on your logic. The builder should have a _type_ property which defines the type of
 addin this builder can build. If the _type_ of a builder is ````null```` then the builder is the default builder for
 all addin types. You may manipulate the builders order within the registry by using the _order_ property of the builder
 addin.
 You may specify the _preBuildTarget_ property of a builder. When this property is specified, the builder will run the
 build function of the builder with _type_ = _preBuildTarget_ if such a builder exists before the build function is called. 
 Your builder will get the result of the build function run by the pre build builder. This allows you to chain builders.
 For example if you want some pre processing done before a set of builders are run, you may write the logic in another builder
 and specify that builder type as the _preBuildTarget_ of all the builders that need the pre processing.

 The _build_ function metadata contains the following properties:
  
 ````path```` - The path in which the built addin resides or ````null```` if the addin doesn't belong to any path 
   (in case ````subdivision.buildAddin(addin)```` was called).
     
 
```js
  //Create a builder that can build addins of type monkey
  var builder = new subdivision.Builder({
                id: 'abc',
                order: 3,
                type: 'monkey',
                preBuildTarget: 'cow',
                build: function (addin, options, metadata) {
                    return {
                       food: addin.food
                    };
               }
            });
```

#### subdivision.addBuilder(options, force) -> Boolean
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

            subdivision.addBuilder(options);
            var builder = subdivision.getBuilder('monkey'); //returns the builder with id 'abc'
```

#### subdivision.getBuilder(type) -> Builder
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

            subdivision.addBuilder(options, true); //Replace the default builder with a new one
            var builder = subdivision.getBuilder(null);
            var builder2 = subdivision.getBuilder('no such type');
            console.log(builder === builder2); //true
```

#### subdivision.build(path, options, searchCriteria, skipSort)-> Array
Builds all the addins in the given _path_ by calling the build function for each addin separately based on its type.
Each builder's build function will take the addin and the _options_ as its arguments.
If _searchCriteria_ is specified the syntax for the is determined by the lodash
[filter function](https://lodash.com/docs#filter) as the _predicate_ argument.
Set _skipSort_ to true if you don't want to sort the returned addins by order.

```js
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin) {
                    return addin.id;
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});

            var items = subdivision.build('aaa'); //['1','2']
```

#### subdivision.build.async(path, searchCriteria, skipSort)-> Promise
Same as ````subdivision.build```` but returns a Promise that resolves with the result array. Does not assume that any of the
builders involved in building the given _path_ are asynchronous. Use this variant if any of the builders for the
_path_ are asynchronous.


#### subdivision.buildAddin(addin, options)-> Any
Builds a single addin object based on its type. The appropriate builder will take the _addin_ and the _options_
as the arguments.

```js
    subdivision.addBuilder({
        id: 'a',
        target: 'monkey',
        build: function (addin, suffix) {
            return addin.id + suffix;
        }
    });

    var addin = {id: '1', type: 'monkey', order: 1};
    var result = subdivision.buildAddin(addin, 'foo'); //1foo
```

#### subdivision.buildAddin.async(addin, options)-> Promise
Same as ````subdivision.buildAddin```` but allows async building. Returns a promise that resolved with the built addin.

#### subdivision.buildTree(path)-> Array
Builds all the addins in the given _path_ by calling the build function for each addin separately based on its type but also
builds all the sub-paths of the given path. When an addin of a sub path is built it is added to the items property of the
parent addin identified by the addin id. For example, if in the path "aaa" there is an addin with id "myId" and in the path
"aaa/myId" there is an addin with id "innerAddinId" then the result of building a tree on the path "aaa" with this
function is the built addin "myId" and in its items property is the built addin "innerAddinId" (see example below).
The default items property is ````$items```` but it can be changed by specifying the ````itemsProperty```` property on
the addin definition.

```js
            subdivision.addBuilder({
                id: 'a',
                target: 'monkey',
                build: function (addin) {
                    return {id: addin.id};
                }
            });

            subdivision.addAddin('aaa', {id: '1', type: 'monkey', order: 1});
            subdivision.addAddin('aaa', {id: '2', type: 'monkey', order: 2});
            subdivision.addAddin('aaa', {id: '3', type: 'monkey', order: 3, itemsProperty: 'stuff'});
            subdivision.addAddin(subdivision.registry.joinPath('aaa', '2'), {id: '1', type: 'monkey', order: 2});
            subdivision.addAddin(subdivision.registry.joinPath('aaa', '2'), {id: '2', type: 'monkey', order: 3});
            subdivision.addAddin(subdivision.registry.joinPath('aaa', '3'), {id: '1', type: 'monkey', order: 3});

            var items = subdivision.buildTree('aaa');
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

#### subdivision.$generateBuilders()
Adds all the builders registered to the builders path in the registry into the internal
builders list. You normally don't need to call this function as it is called automatically
at the initialization of the library. Functions like ````getBuilder```` and ````addBuilder````
 work with the internal structure and not the path.

#### subdivision.$clearBuilders()
Forcefully clears all the builders from the internal structures. You should never call this function unless you
are absolutely sure you know what you are doing.

## Bootstrapping everything up
Once you are done loading all the manifests and doing other initialization relevant for your application a call to
 ````subdivision.start()```` should be made to initialize subdivision and build the registry and initialize all the parts
 of subdivision (see following sections for various optional library concepts).

#### subdivision.start() -> Promise
 Initializes the registry, builders, services, and other concepts of subdivision. Note that all the internal structures are reset
 except for the registry therefore you should use the various manifest functions to initialize the library prior to calling ````start()````
 and ````add*```` functions after calling ````start()````.
 You must call this function to start working with subdivision.
 Returns a promise that resolves once all the initialization (including custom initialization functions provided by the user)
 are complete.

## Optional Concepts
All the concepts in the following paragraphs are completely optional. They are here to help
you organize your code into well known patterns with the help of this library.


## Values

Values are designed to save you some boilerplate when you want to store some values (primitives or objects) in the
registry.

#### Values path in the registry
In the code
```js
subdivision.systemPaths.values
```

In the manifest
```js
subdivision/values
```

#### Destructuring friendly property

```js
const {myValue1, myValue2} = subdivision.values; //Those are value names
```

#### subdivision.getValue(name) -> Anything
 Returns the value with the given _name_ from the registry.
 
```js
var myObj = {};
subdivision.setValue('Foo',myObj);
subdivision.getValue('Foo'); //return myObj
```

#### subdivision.addValue(name, value, override)
Adds a value to subdivision. You may later retrieve that value by using ````getValue```` or by
using the ````subdivision.values```` object. If a value with the given _name_ already exists, calling 
add value with _name_ will throw an exception unless _override_ is set to ````true````. 

```js
subdivision.setValue('foo',123);


subdivision.setValue('foo',456, true);
console.log(subdivision.values.foo); //456
```
 
## Services

Services are singleton objects that are accessible from anywhere within the code without directly referencing them
(similar to Angular.js services). The services are identified by ````name```` because they are built hierarchically.
 For example if a service with the name _FooService_ is registered and it has a method _bar_, and another service with the
 name _FooService_ is registered and it has the method _baz_ then the final service will have both _bar_ and _baz_ method.
 This is achieved simply by creating prototypical inheritance between all service instances with the same name in the order
 they appear in the registry (again, order is key).

#### Services path in the registry
In the code
```js
subdivision.systemPaths.services
```

In the manifest
```js
subdivision/services
```

#### Destructuring friendly property

```js
const {myService1, myService2} = subdivision.services; //Those are service names
```

#### subdivision.Service(options, prototype) -> Service (The service constructor)
Creates a new service from the given options and assigns the given prototype as the prototype of the created service.
Normally you don't need to use the service constructor.

Each service has two builtin properties:

* **$vent** - An events aggregator (equivalent to Backbone.Events object) which is used by the service to trigger events.
You should use this event aggregator for any events emitted by your service instance.

* **$next** - The next service in the chain (in current implementation equivalent to ````__proto__```` but you should not rely on that).
Use this property to traverse the services chain. This is useful when you need to access your own service explicitly which must be
uniquely identified by ````id```` as any subdivision addin.

#### subdivision.getService(name) -> Service
Returns the service with the given name or undefined if no service with the given name exists.

```js
  var routingService = subdivision.getService('Routing Service');
  routingService.doSomething();
```

#### subdivision.addService(name, options, override) -> Service
Adds a service with the given name to the end of the services chain based on the given options. If the override flag is
set to true, the existing service chain with the given name is completely removed and a new chain is started with the created service.
Note that if some module is holding a service instance, that instance will not be changed.

**You should never hold on to an instance of a service and always call ````subdivision.getService()```` when your code needs the service.
This call is very cheap!**


### Service initialization
When subdivision first starts it calls the ````subdivision.buildServices```` method. This method builds all the services registered on the services
path in the registry. For each service in the registry it first calls _before:service:initialized_ event on ````subdivision.vent````
_callback(serviceName)_ then tries to run the service _initialize_ method if one exists. This method may return subdivision.Promise.
When all the services are initialized it will trigger the _after:service:initialized_ event on ````subdivision.vent```` _callback(serviceName, service)_.
If your service needs access to some other service after it was initialized but before the application starts, you should register to this
event as it guarantees that all services were initialized when called.

### Defining a service
The default definition of a service is done through the _content_ property of the service addin.

```js
var manifest = {
  paths: [{
    path: subdivision.systemPaths.services,
    addins: [
      {
        id: 'MyService',
        name: 'somethingService',
        type: 'subdivision.service',
        order: 100,
        content: {
           doSomething: function(){
           },
           doAnotherThing: function(){
           }
        }
      }
    ]
  }]
};
```

## Commands

Commands are a standard mechanism that exists in many UI frameworks. The commands implementation in this library is
a minimal one and allows you complete freedom on extending the commands functionality. The goal is to provide the basics
for you to use commands but allow you more complex use cases. The command is a way to invoke some functionality anywhere
in the system.

#### Commands path in the registry
In the code
```js
subdivision.systemPaths.commands
```

In the manifest
```js
subdivision/commands
```

#### Destructuring friendly property

```js
const {myCommand1, myCommand2} = subdivision.commands; //Those are command names
```


#### subdivision.Command(options) -> Command (The command constructor)
Creates a new command from the given options. The command must have an ````execute```` function which executes the command.
You may provide an optional ````isValid```` function that determines if the command is ready to be executed or not.
The ````isValid```` function should only determine the command specific validity and normally you
don't need to define this function. The function that determines if a command can be executed is the
````canExecute```` function.
The default implementation evaluates the condition (see below) of the command **and** the ````isValid````
function. It returns true if both the condition ````isValid```` and the command ````isValid```` return a truthy value
or were undefined.
The condition is defined using the ````condition```` property. It can be either a ````subdivision.Condition```` instance,
a registered condition name, or even boolean logic on registered condition names. For example, if you have registered conditions
_foo_, _bar_, and _baz_ then a valid value for that property can be ````'!foo & (bar | baz)'````

```js
 var command = new subdivision.Command({
                id: 'aa',
                name: 'bb',
                execute: function () {
                   console.log('foo!');
                }
            });
 if (command.canExecute()){
   command.execute(); //foo!
 }
```

Currently the command is more of a wrapper for your commands. It will receive more functionality in future versions.

#### subdivision.Command.$canExecute -> Boolean

The default implementation of the ````canExecute```` function for all commands. It is assigned to any command created
either by the ````new```` operator, ````addCommand```` function, or the manifest reader. Override the default implementation to affect all newly created
commands.

#### subdivision.getCommand(name) -> command

Returns a command with the given _name_ or undefined if no command with the given _name_ was defined.

```js
 subdivision.addCommand({
                name: 'monkey',
                execute: function () {
                  console.log('bar!');
                }
            });

            var command = subdivision.getCommand('monkey');
            command.execute('bar!');
```

#### subdivision.addCommand(options, force) -> Boolean

Creates a command from the given _options_ and adds it to subdivision.
If a command with the same name (as in ````options.name````) already exists then the _force_ parameter is used.
When _force_ is truthy, the old command is removed using ````removeCommand```` , the new command is added, and true
is returned.
When _force_ is falsy, the old command remains and false is returned.
If _options_ has an ````initialize```` function, this function is invoke after the command was added.

```js
 subdivision.addCommand({
                name: 'monkey',
                execute: function () {
                  console.log('bar!');
                }
            });

            var command = subdivision.getCommand('monkey');
            command.execute('bar!');
```

#### subdivision.removeCommand(name)

Removes a command with the given _name_ from the library (i.e. you will no longer be able to get it with ````getCommand````).
If the removed command has a ````destroy```` function, that function is invoked before the command is removed.

```js
 subdivision.addCommand({
                name: 'monkey',
                execute: function () {
                  console.log('bar!');
                },
                destroy: function(){
                  console.log('Goodbye cruel world!');
                }
            });

            subdivision.removeCommand('monkey'); //Goodbye cruel world!
            subdivision.getCommand('monkey'); //undefined
```

#### subdivision.$clearCommands()
Forcefully clears all the commands from the internal structures. None of the ````destroy```` functions will be called.
You should never call this function unless you are absolutely sure you know what you are doing.

## Conditions

A condition is a "smart" boolean flag which tracks some system state and can instantly answer if some predefined
condition is met. For example a condition can track the currently selected item in your application and return true
if the item is unsaved. In this case the condition will track the select item, its changes, and the save function.
The condition must have an ````isValid```` function which returns the state of the condition. It is common to save
some underlying property in the condition and update that property. The ````isValid```` function only returns the
state of that property. Subdivision gives a general structure for defining and managing condition. You may even create
new conditions by using boolean logic. The three supported operators are _!_ (not), _&_ (and), and _|_ (or).

#### Conditions path in the registry
In the code
```js
subdivision.systemPaths.conditions
```

In the manifest
```js
subdivision/conditions
```

#### Destructuring friendly property

```js
const {myCondition1, myCondition2} = subdivision.conditions; //Those are condition names
```


#### subdivision.Condition(options) -> Condition (The condition constructor)
Creates a new condition but does not register it into the internal conditions registry.
The _options_ must have either an ````isValid```` function or an ````isValid```` string which is a boolean
representation of operations between other conditions. For example if there are conditions foo and bar registered in the
internal conditions registry then ````isValid```` can be equal ````'foo & bar'````. In this case the newly created condition
is considered valid when both foo and bar conditions are valid.



### Subdivision as a singleton in Node.js
Since version 0.3.0 the subdivision singleton will be loaded as a true singleton regardless of 
the module that required it as long as it has the same major version.
For example if you have three modules A,B,and C. Module A requires subdivision version 1.0.3, module B requires subdivision
version 1.1.0, and module C requires subdivision version 2.0.0 then A and B will get the same instance of the module while
C gets another instance. This is to make sure that major versions with breaking API changes will not be accidentally used
where they should not. You can avoid this behaviour by setting the ````global.subdivision.singleton.reset```` symbol to
````true```` on the global variable before requiring subdivision. When this symbol is true you will get a new instance 
of subdivision as long as you require different versions of the module or require with a different path.

The following code will set the reset symbol to ````true````
```js
    var resetSymbol = Symbol.for('global.subdivision.singleton.reset');
    global[resetSymbol] = true;
```

## Unit Tests

1. Be sure you have NodeJS and NPM installed on your system

2. Run `npm install` to install Karma and Mocha

3. From the project folder, run `npm run-script test1` to execute the unit tests

## Building

1. Run `grunt build`

If all went well, the appropriate files should be generated in the dist directory

##Change Log

(Note: sometimes minor breaking changes appear in minor versions. If this is a problem for your process please open
an issue)

### 0.3.2 -> 0.3.3

* Services are built sequentially instead of in parallel adhering to the addin order

### 0.3.1 -> 0.3.2

* Bumped version due to build issues

### 0.3.0 -> 0.3.1

* Added the Value construct

* Added destructuring friendly properties to all the constructs (Builder, Service, Value, Command, Condition)


### 0.2.1 -> 0.3.0

* **BREAKING** Renamed ````readManifestFilesSync```` to ````readManifestFiles```` to be compatible with other APIs.

* **BREAKING** Renamed ````readManifestFiles```` to ````readManifestFiles.async```` to be compatible with other APIs.
  
* **POSSIBLY BREAKING** Added a new parameter _metadata_ to the builder's _build_ handler.
  
* removed the example from the repository (I will add an example in a separate repository)

* [Node.js only] require('subdivision') will now return the subdivision singleton regardless of the module using it.

### 0.2.0 -> 0.2.1

* You may specify the _preBuildTarget_ property for builders if you need pre processing before the build function

* Default order for all addins is now specified at ````subdivision.registry.$defaultOrder````

* Updated the dependencies to the latest versions

* Minor changes to readme

### 0.1.3 -> 0.2.0

* Added the ````buildAddin```` and the ````buildAddin.async```` functions.

* **POSSIBLY BREAKING** Added a new parameter _options_ to the various ````build```` functions.

##License
(MIT License)
Copyright (c) 2014-2016 Boris Kozorovitzky, 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


