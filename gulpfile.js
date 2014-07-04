'use strict';

var gulp     = require('gulp'),
    plugins  = require('gulp-load-plugins')(),
    sequence = require('run-sequence'),
    util     = plugins.util,
    paths    = {};

// paths:
// Default paths to be used by tasks

paths.package = ['./package.json'];
paths.common  = ['./gulpfile.js', './lib/**/*.js'];
paths.tests   = ['./test/**/*.js', '!test/{temp,temp/**}'];
paths.watch   = [].concat(paths.common, paths.tests);

// ===================
// TASKS
// ===================

// task:style
// -------------------
// Ensure code conforms to a specified styleguide

gulp.task('style', function() {
    return gulp.src(paths.watch).pipe(plugins.jscs());
});

// task:lint
// -------------------
// Ensure code follows specified conventions

gulp.task('lint', function() {
    return gulp.src(paths.watch)
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .on('error', util.log);
});

// task:mocha
// -------------------
// Perform UNIT testing

gulp.task('mocha', function() {
    gulp.src(['./test/**/*.js'], {
        read: false
    })
    .pipe(plugins.plumber())
    .pipe(plugins.coverage.instrument({
        pattern: ['./lib/**/*.js'],
        debugDirectory: '_temp'
    }))
    .pipe(plugins.mocha({
        reporter: 'list'
    }))
    .pipe(plugins.coverage.report({
        outFile: 'test/coverage/index.html'
    }))
    .on('error', util.log);
});

// task:bump
// -------------------
// Manage semver for project

gulp.task('bump', ['test'], function() {
    var bumpType = plugins.util.env.type || 'patch'; // major.minor.patch
    return gulp.src([paths.package])
        .pipe(plugins.bump({
            type: bumpType
        }))
        .pipe(gulp.dest('./'))
        .on('error', util.log);
});

// task:watch
// -------------------
// Run specified tasks when changes detected

gulp.task('watch', ['test'], function() {
    gulp.watch(paths.watch, ['test']);
});

// task:aliases
// -------------------
// Aliases for a given colleciton of tasks

gulp.task('test', function (cb) {
    sequence('style', 'lint', 'mocha', cb);
});

gulp.task('release', ['bump']);
gulp.task('default', ['test']);
