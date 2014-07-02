/*jshint -W068 */

'use strict';

var boulevard = require('../lib/boulevard.js'),
    util      = require('./lib/util'),

    fixtures  = require('./fixtures/expected.json'),
    should    = require('should');

describe('boulevard', function() {

    var processor;

    before(function () {
        processor = boulevard('./test/fixtures/manifest.json');
    });

    describe('should', function () {

        it('be a function', function() {
            return boulevard.should.an.Function;
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

            it('a function if a manifest is found', function () {
                return processor.should.an.Function;
            });

            it('a default config for a route that does not exist', function (done) {
                processor('/some/path/that/does/not/exist').on('data', function (err, data) {
                    return data.should.be.an.Object && done();
                });
            });

            // top level route

            it('a config for a route that does exist', function (done) {
                processor('/').on('data', function (err, data) {
                    return data.should.be.an.Object && done();
                });
            });

            // children level

            it('a config for a sub route that does exist', function (done) {

                util.async(['entertainment'], function (item, next) {

                    processor(item).on('data', function (err, data) {
                        return next(null, data);
                    });

                }, function (err, results) {

                    if (err) {
                        return done(err);
                    }

                    results.forEach(function (result) {
                        result.should.be.an.Object;
                        console.log(result);
                        should(result).eql(fixtures.sub_route);
                    });

                    done();

                });

            });

        });

    });

});
