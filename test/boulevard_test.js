/*jshint -W068, unused: false */

'use strict';

var boulevard = require('../'),
    util      = require('../lib/util'),
    fixtures  = require('./fixtures'),
    should    = require('should');

describe('boulevard', function() {

    describe('[ COMMON ]', function () {

        it('should be a function', function() {
            var result = boulevard.should.be.an.Function;
        });

        it('should have a helper method', function() {
            var result = boulevard.helper.should.be.an.Function;
        });

        it('should throw an error if no manifest path specified', function () {
            (function () {
                boulevard();
            }).should.throw();
        });

        it('should throw an error if a manifest is not found', function () {
            (function () {
                boulevard('./manifest.json');
            }).should.throw();
        });

        it('should throw an error if an invalid route processed', function (done) {

            boulevard(fixtures.simple.source)(null, function (err) {
                return should(err).Error && done();
            });

        });

        it('should throw an error if no callback specified', function () {

            (function () {
                boulevard(fixtures.simple)('/some/path');
            }).should.throw();

        });

        it('should return from cache if requested more than once', function (done) {

            var blvd = boulevard(fixtures.simple.source);

            blvd('/', function (err, first) {
                blvd('/', function (err, second) {
                    return second.should.be.an.Object && should(first).eql(second) && done();
                });
            });

        });

    });

    describe('[ ROUTES ]', function () {

        Object.keys(fixtures).forEach(function (fixture) {
        //['inherited'].forEach(function (fixture) {

            describe('[ ' + fixture.toUpperCase() + ' ]', function () {

                var name      = fixture,
                    current   = fixtures[fixture],
                    processor = current.source && boulevard(current.source, current.options || {}),

                    tests   = Array.isArray(current.tests) && current.tests || [];

                tests.forEach(function (test) {

                    var method = test.skip ? it.skip : it,
                        testProcessor = test.source &&
                                        boulevard(test.source, test.options || current.options || {}) ||
                                        processor,

			            name       = test.name ? '[ ' + test.name + ' ] "' + test.route + '"' : '"' + test.route + '" ',
                        labelDesc  = name + test.description;

                    method(labelDesc, function (done) {

                       testProcessor(test.route, function (err, data) {

                            if (err) {
                                return done(err);
                            }

                            var result = util._.isFunction(test.expected) && test.expected(data) ||
                                         data.should.be.an.Object && should(data).eql(test.expected);

                            done();

                        });

                    });

                });

            });

        });

    });

});
