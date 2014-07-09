'use strict';

var gulp     = require('gulp'),
    plugins  = require('gulp-load-plugins')(),
    sequence = require('run-sequence'),
    util     = plugins.util,
    paths    = {};

// paths:
// Default paths to be used by tasks

paths.package = ['./package.json'];
paths.source  = ['./lib/**/*.js'];
paths.common  = ['./gulpfile.js'].concat(paths.source);
paths.tests   = ['./test/**/*.js', '!test/{temp,temp/**}'];
paths.watch   = [].concat(paths.common, paths.tests);

// ===================
// TASKS
// ===================

// task:lint
// -------------------
// Ensure code follows specified conventions

gulp.task('lint', function() {
    return gulp.src(paths.watch)
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.plumber())
        .pipe(plugins.jscs())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .on('error', util.log);
});

// task:mocha
// -------------------
// Code tests && coverage

gulp.task('mocha', function() {
    gulp.src(paths.tests, {
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
    sequence('lint', 'mocha', cb);
});

gulp.task('default', ['test']);
