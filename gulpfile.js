var gulp = require('gulp');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
var bower = require('gulp-bower');

gulp.task('coffee', function() {
  gulp.src('./src/**/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./'));
});

gulp.task('bower', function() {
  bower('./bower_components');
});

gulp.task('lib', function() {
  gulp.src([
    './bower_components/rsvp/rsvp.amd.js',
    './bower_components/event-emitter/dist/EventEmitter.js'
  ])
    .pipe(gulp.dest('./dist/lib'));
});

gulp.task('default', ['coffee', 'bower', 'lib']);
