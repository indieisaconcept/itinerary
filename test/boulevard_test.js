/*jshint -W068, unused: false */

'use strict';

var boulevard = require('../lib/boulevard.js'),

    fixtures  = require('./fixtures'),
    should    = require('should'),

    // processor:
    // configure boulevard processed required for testing
    // here. There should be a 1:1 mapping between a processor
    // and a fixture.
    //
    // fixtures can be found in ./fixtures

    processor = {
        simple    : boulevard(fixtures.simple.source),
        inherited : boulevard(fixtures.inherited.source),
        advanced  : boulevard(fixtures.advanced.source)
    };

describe('Boulevard', function() {

    describe('should', function () {

        it('be a function', function() {
            var result = boulevard.should.an.Function;
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

            it('function if a manifest is found', function () {
                var result = processor.simple.should.an.Function &&
                             processor.advanced.should.an.Function;
            });

            describe('config', function () {

                it('for a route that does exist', function (done) {
                    processor.simple('/').on('data', function (err, data) {
                        var result = data.should.be.an.Object;
                        done();
                    });
                });

                it('for a route that does not exist', function (done) {
                    processor.simple('/some/path/that/does/not/exist').on('data', function (err, data) {
                        var result = data.should.be.an.Object;
                        done();
                    });
                });

                it('for a child route', function (done) {

                    processor.simple('/foo').on('data', function (err, data) {

                        if (err) {
                            return done(err);
                        }

                        var result = data.should.be.an.Object &&
                                     should(data).eql(fixtures.simple.source.route.foo.config);

                        done();

                    });

                });

            });

        });

    });

});
