var jshint = require('gulp-jshint');
var gulp = require('gulp');
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');


gulp.task('jshint', function () {
  return gulp.src('./public/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


// Minify and compile handlebars templates
gulp.task('templates', function () {
  return gulp.src('./public/js/**/*.hbs')
    .pipe(handlebars())
    .pipe(defineModule('commonjs'))
    .pipe(gulp.dest('./public/templates'));
});

//gulp.task('copy:js', function () {
//  return gulp.src('./public/js/**/*.js')
//    .pipe(gulp.dest('./dist/js'));
//});

gulp.task('build', ['jshint', 'templates'], function () {

});

// Clean all and build from scratch
gulp.task('default', ['build'], function () {
});
