/*jshint -W068, unused: false */

'use strict';

var boulevard = require('../'),
    helpers   = require('../lib/helpers'),

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
        advanced  : boulevard(fixtures.advanced.source),

        // templates:
        // These are rules which are used to classify a route. These values,
        // can then be used for filtering. They can either be a regex or a
        // function

        templates : boulevard(fixtures.simple.source, {
            templates: {
                story: /story-(.{8})-(\d{13})/
            }
        }),

        // helpers:
        // These are used to process a collection and modify or filter values as
        // required

        helpers: boulevard(fixtures.helpers.source, {
            helpers: {
                'assets.js': helpers.use('rev')
            }
        })

    };

describe('boulevard', function() {

    describe('should', function () {

        it('be a function', function() {
            var result = boulevard.should.an.Function;
        });

        it('should have a helpers method', function() {
            var result = boulevard.helpers.should.an.Object;
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

        describe('discover', function () {

            it('template type for a give route if set', function (done) {

               processor.templates('/story-12345678-1234567891011').on('data', function (err, data) {

                    if (err) {
                        return done(err);
                    }

                    var result = data.should.be.an.Object &&
                                 should(data.templates.story).eql(true);

                    done();

                });

            });

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
                                     should(data.config.assets).eql(fixtures.simple.source.route.foo.config.assets);

                        done();

                    });

                });

                it('for a route containing an inherited top level config', function (done) {

                    processor.inherited('/foo').on('data', function (err, data) {

                        if (err) {
                            return done(err);
                        }

                        var result = data.should.be.an.Object &&
                                     should(data.config.assets).eql(fixtures.inherited.expected.config.assets);

                        done();

                    });

                });

                it('for a route that has been modified by a helper', function (done) {

                    processor.helpers('/foo').on('data', function (err, data) {

                        if (err) {
                            return done(err);
                        }

                        var result = data.should.be.an.Object &&
                                     should(data.config).eql(fixtures.helpers.expected.config);

                        done();

                    });

                });

            });

        });

    });

});
