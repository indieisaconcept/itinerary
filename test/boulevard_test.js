/*jshint -W068, unused: false */

'use strict';

var boulevard = require('../'),

    fixtures  = require('./fixtures'),
    should    = require('should');

describe('boulevard', function() {

    describe('should', function () {

        it('be a function', function() {
            var result = boulevard.should.be.an.Function;
        });

        it('should have a helper method', function() {
            var result = boulevard.helper.should.be.an.Function;
        });

        it('throw an error if no manifest path specified', function () {
            (function () {
                boulevard();
            }).should.throw();
        });

        it('throw an error if a manifest is not found', function () {
            (function () {
                boulevard('./manifest.json');
            }).should.throw();
        });

        describe('return', function () {

            Object.keys(fixtures).forEach(function (fixture) {
            //['simple', 'inherited', 'helper', 'template'].forEach(function (fixture) {

                describe('[' + fixture + ']', function () {

                    var name      = fixture,
                        current   = fixtures[fixture],
                        processor = boulevard(current.source, current.options || {});

                    // it('function if a manifest is found', function () {
                    //     var result = processor.should.an.Function;
                    // });

                    describe('config', function () {

                        var tests   = Array.isArray(current.tests) && current.tests || [];

                        tests.forEach(function (test) {

                            it(test.description, function (done) {

                               processor(test.route).on('data', function (err, data) {

                                    if (err) {
                                        return done(err);
                                    }

                                    var result = data.should.be.an.Object &&
                                                 should(data).eql(test.expected);

                                    done();

                                });

                            });

                        });

                    });

                });

            });

        });

    });

});
