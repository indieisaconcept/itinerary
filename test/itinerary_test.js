/*jshint -W068, unused: false */

'use strict';

var itinerary = require('../'),
    util      = require('../lib/util'),
    fixtures  = require('./fixtures'),
    async     = require('async'),
    should    = require('should');

describe('itinerary', function() {

    describe('[ COMMON ]', function() {

        it('should be a function', function() {
            var result = itinerary.should.be.an.Function;
        });

        it('should have a helper method', function() {
            var result = itinerary.helper.should.be.an.Function;
        });

        it('should throw an error if no manifest path specified', function() {
            (function() {
                itinerary();
            }).should.throw();
        });

        it('should throw an error if a manifest is not found', function() {
            (function() {
                itinerary('./manifest.json');
            }).should.throw();
        });

        it('should throw an error if an invalid route processed', function(done) {

            itinerary(fixtures.simple.source)(null, function(err) {
                return should(err).Error && done();
            });

        });

        it('should throw an error if no callback specified', function() {

            (function() {
                itinerary(fixtures.simple)('/some/path');
            }).should.throw();

        });

        it('should return from cache if requested more than once', function() {

            var itin = itinerary(fixtures.simple.source);

            async.series({
                first: function(callback){
                    itin('/', callback);
                },
                second: function(callback){
                    itin('/', callback);
                }
            },
            function(err, results) {
                return results.second.should.be.an.Object && should(results.first.config).eql(results.second.config);
            });

        });

        it('should return a helper which a get method', function(done) {

            var itin = itinerary(fixtures.simple.source);

            itin('/', function(err, data, helper) {
                return data.should.be.an.Object &&
                    helper.should.be.an.Object &&
                    helper.get.should.be.a.Function && done();
            });

        });

        it('should return a helper which can be used to retrieve a config', function(done) {

            var itin = itinerary(fixtures.simple.source);

            itin('/', function(err, data, helper) {
                return should(helper.get()).be.an.Object && done();
            });

        });

        it('should return a helper which can be used to retrieve a config value', function(done) {

            var itin = itinerary(fixtures.simple.source);

            itin('/', function(err, data, helper) {

                var get = helper.get,
                expected = '1.js';

                return should(get('config.assets.js')[0]).eql(expected) &&
                    should(get('assets.js')[0]).eql(expected) && done();
            });

        });

        it('should return a helper which can be used to retrieve a template value', function(done) {

            var itin = itinerary(fixtures.simple.source);

            itin('/', function(err, data, helper) {
                return should(helper.get('template')).be.an.Object && done();
            });

        });

    });

    describe('[ ROUTES ]', function() {

        Object.keys(fixtures).forEach(function(fixture) {
            //['inherited'].forEach(function (fixture) {

            describe('[ ' + fixture.toUpperCase() + ' ]', function() {

                var name = fixture,
                    current = fixtures[fixture],
                    processor = current.source && itinerary(current.source, current.options || {}),

                    tests = Array.isArray(current.tests) && current.tests || [];

                tests.forEach(function(test) {

                    var method = test.skip ? it.skip : it,
                        testProcessor = test.source &&
                        itinerary(test.source, test.options || current.options || {}) ||
                        processor,

                        name = test.name ? '[ ' + test.name + ' ] "' + test.route + '"' : '"' + test.route + '" ',
                        labelDesc = name + test.description;

                    method(labelDesc, function(done) {

                        testProcessor(test.route, function(err, data, helper) {

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
