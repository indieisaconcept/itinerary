'use strict';

var gulp     = require('gulp'),
    plugins  = require('gulp-load-plugins')(),
    sequence = require('run-sequence'),
    util     = plugins.util,
    paths    = {};

// paths:
// Default paths to be used by tasks

paths.cov     = './test/coverage';
paths.package = ['./package.json'];
paths.source  = ['./lib/**/*.js'];
paths.common  = ['./gulpfile.js'].concat(paths.source);
paths.tests   = ['./test/*.js', '!test/{temp,coverage}/**}'];
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

// task:istanbul
// -------------------
// Code tests && coverage

gulp.task('istanbul', function (cb) {

    gulp.src(paths.source)
        .pipe(plugins.istanbul()) // Covering files
        .on('finish', function() {
            gulp.src(paths.tests)
                .pipe(plugins.plumber())
                .pipe(plugins.mocha({
                    reporter: 'list'
                }))
                .pipe(plugins.istanbul.writeReports({
                    dir: paths.cov,
                    reporters: [ 'lcov', 'json', 'text', 'text-summary' ],
                    reportOpts: { dir: paths.cov },
                }))
                .on('finish', function() {
                    process.chdir(__dirname);
                    cb();
                });
        })
        .on('error', util.log);

});

// task:mocha
// -------------------
// Run mocha standalone

gulp.task('mocha', function () {

    gulp.src(paths.tests)
        .pipe(plugins.plumber())
        .pipe(plugins.mocha({
            reporter: 'list'
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
    sequence('lint', 'istanbul', cb);
});

gulp.task('default', ['test']);
