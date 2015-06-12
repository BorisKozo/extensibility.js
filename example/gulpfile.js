'use strict';

var path = require('path');
var jshint = require('gulp-jshint');
var gulp = require('gulp');
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');
//var del = require('del');
//var shell = require('gulp-shell');
var connect = require('gulp-connect');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var concatCss = require('gulp-concat-css');
var flatten = require('gulp-flatten');
var compileModules = require('./gulp-compile-ejs-modules');


gulp.task('jshint', function () {
  return gulp.src('./src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


// Minify and compile handlebars templates
gulp.task('templates', function () {
  return gulp.src('./src/js/**/*.hbs')
    .pipe(handlebars())
    .pipe(defineModule('commonjs'))
    .pipe(gulp.dest('./public/templates'));
});

gulp.task('copy:js', function () {
  return gulp.src('./src/js/**/*.js')
    .pipe(gulp.dest('./public/js'));
});

gulp.task('copy:html', function () {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./public'));

});

gulp.task('copy:vendor:css', function () {
  gulp.src('./public/jspm_packages/**/*.css')
    .pipe(flatten())
    .pipe(gulp.dest('./public/css'));

  gulp.src('./vendor/**/*.css')
    .pipe(flatten())
    .pipe(gulp.dest('./public/css'));

});

gulp.task('less', function () {
  gulp.src('./src/**/*.less')
    .pipe(less())
    .pipe(minifyCss())
    .pipe(concatCss('main.css'))
    .pipe(gulp.dest('./public/css'));

});
//gulp.task('clean', function (callback) {
//  del('./public', callback);
//});

//gulp.task('jspm', shell.task([
//  'jspm init -y', 'jspm install'
//]));

gulp.task('watch', function () {
  gulp.watch('./src/js/**/*.js', ['copy:js']);
  gulp.watch('./src/js/**/*.ejs.js',['compile:modules']);
  gulp.watch('./src/js/**/*.hbs', ['templates']);
  gulp.watch('./src/**/*.html', ['copy:html']);
  gulp.watch('./src/**/*.less', ['less']);
  gulp.watch('./../dist/extensibility.js', ['copy:ejs']);
});

gulp.task('copy:ejs', function () {
  gulp.src('./../dist/extensibility.js')
    .pipe(gulp.dest('./public/vendor'));
});

gulp.task('copy:vendor', function () {
  gulp.src('./vendor/**/*.js')
    .pipe(gulp.dest('./public/vendor'));
});

gulp.task('compile:modules', function () {
  return gulp.src(['./src/js/**/*.ejs.js'])
    .pipe(compileModules('modules.js', {
      prefix: '\'use strict\';\n\n',
      cwd: path.join(__dirname, 'src')
    }))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('build', ['jshint', 'copy:js', 'copy:ejs', 'copy:html', 'compile:modules', 'templates', 'copy:vendor', 'copy:vendor:css', 'less', 'watch'], function () {
  connect.server({
    port: 8000,
    root: 'public'
  });
});


// Clean all and build from scratch
gulp.task('default', ['build'], function () {
});
