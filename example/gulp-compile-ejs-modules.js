//This code is strongly based on the gulp-concat plugin by wearefractal at https://github.com/wearefractal/gulp-concat
//All credit goes to the guys maintaining that project

'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function (file, options) {
  if (!file) {
    throw new PluginError('gulp-compile-ejs-modules', 'Missing file option for gulp-compile-ejs-modules');
  }
  options = options || {};

  var prefix = options.prefix;
  var result = prefix + gutil.linefeed;
  var cwd = options.cwd;

  var firstFile;
  var fileName;


  if (typeof file === 'string') {
    fileName = file;
  } else if (typeof file.path === 'string') {
    fileName = path.basename(file.path);
    firstFile = new File(file);
  } else {
    throw new PluginError('gulp-compile-ejs-modules', 'Missing path in file options for gulp-compile-ejs-modules');
  }

  function bufferContents(file, enc, cb) {
    // ignore empty files
    if (file.isNull()) {
      cb();
      return;
    }

    // we dont do streams (yet)
    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-compile-ejs-modules', 'Streaming not supported'));
      cb();
      return;
    }

    // set first file if not already set
    if (!firstFile) {
      firstFile = file;
      cwd = cwd || file.cwd;
    }


    var fullFileName = file.history[0];
    if (fullFileName.indexOf(cwd) === 0) {
      fileName = fullFileName.substr(cwd.length);
      fileName = fileName.replace(/\\/g, '/').replace(/\.js$/, '');
      if (fileName[0] === '/') {
        fileName = fileName.substr(1);
      }
      result += 'import \'' + fileName + '\';' + gutil.linefeed;
    }
    cb();
  }

  function endStream(cb) {
    // no files passed in, no file goes out
    if (!firstFile) {
      cb();
      return;
    }

    var joinedFile;

    // if file opt was a file path
    // clone everything from the first file
    if (typeof file === 'string') {
      joinedFile = firstFile.clone({contents: false});
      joinedFile.path = path.join(firstFile.base, file);
    } else {
      joinedFile = firstFile;
    }

    joinedFile.contents = new Buffer(result, 'ascii');

    this.push(joinedFile);
    cb();
  }

  return through.obj(bufferContents, endStream);
};
