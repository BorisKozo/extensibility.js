EJS Example
==========================================
This example shows the basic principles of how you may use the library. This is merely a suggestion of how I would write
 the application. I am using Backbone.Marionette for managing my MV* and JSPM fo module management and ES6 compilation (via Babel).
 Naturally, you don't need any of these and you can use EJS with simple HTML and JavaScript or with any other framework or
 library (e.g. Ember.js, React, Angular.js)
 
### Running the application
 Simply start a web http server in the ````public```` directory.
 
### Building the application
 I am using Gulp (node.js) and JSPM for building the application files into the public directory. The process is not yet 
 fully automatic (pull requests are welcome here :)) but you may follow these steps:
 
 1. Install jspm-cli and grunt-cli globaly ````npm install jspm/jspm-cli grunt-cli -g````
   
 2. In the example directory do ````npm install```` to install all the node dependencies.
 
 3. In the example directory do ````jspm init```` (use all the default options)
 
 4. In the example directory do ````jspm install```` this will bring all the dependencies into the public directory.
 
 5. In the example directory do ````gulp build```` this will build the entire project into the public directory and 
    run a webserver on port 9000 (the default port for Codefresh.io). 

### Special Gulp task
There is a special Gulp task called ````gulp-compile-ejs-modules````. It compiles a new file which references all the modules
with ````.ejs.js```` extension. You may use this task as is for your project to do the same (if someone will open an issue on publishing
it I will consider doing so). More on ````.ejs.js```` files in the next sections of this document.
