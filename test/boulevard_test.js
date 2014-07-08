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

                       testProcessor(test.route).on('data', function (err, data) {

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
