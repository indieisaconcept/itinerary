/*jshint -W068, unused: false */

'use strict';

var helper = require('../lib/helper'),
    should = require('should'),

    fixture = [
        'a.css',
        {
            href: 'b.css',
            include: {
                story : false
            }
        },
        'a.js',
        {
            src: 'b.js',
            include: {
                story: true
            }
        }
    ],
    noop = function () {};

describe('boulevard', function() {

    describe('[ HELPER ]', function () {

        it ('should be a function', function () {
            var result = helper.should.be.a.Function;
        });

        describe('[ USE ]', function () {

            it ('should return a function if a single argument passed "helper helper"', function () {
                var result = helper('rev include').should.be.a.Function;
            });

            it ('should throw an error if no name passed: helper()', function () {
                (function () {
                    helper();
                }).should.throw();
            });

        });

        describe('[ REGISTER ]', function () {

            it ('should throw an error if a helper name is not a function when registering: helper([], [])', function () {
                (function () {
                    helper([], noop);
                }).should.throw();
            });

            it ('should throw an error if a handler is not a function when registering: helper("name", [])', function () {
                (function () {
                    helper('nohandler', []);
                }).should.throw();
            });

            it ('should throw an error if a duplicate handler name is detected', function () {
                (function () {
                    helper('rev', noop);
                }).should.throw();
            });

            it ('should register a helper function', function () {
                helper('mycustomhelper', noop);
                var result = helper.registered.mycustomhelper.should.be.a.Function;
            });

        });

        describe('[ REGISTERED ]', function () {

            describe('[ REV ]', function () {

                it('should modify filename to include a version', function () {

                    var handler    = helper('rev'),
                        collection = JSON.parse(JSON.stringify(fixture)),
                        result     = handler(collection, {
                            route: '/some/path',
                            parent: {
                                template: {}
                            },
                            manifest: {
                                version: '1.0.0'
                            }
                        });

                    should(result[0]).eql('a_100.css');
                    should(result[1].href).eql('b_100.css');
                    should(result[2]).eql('a_100.js');
                    should(result[3].src).eql('b_100.js');

                });

            });

            describe('[ INCLUDE ]', function () {

                it('should filter results based upon a set condition', function () {

                    var handler    = helper('include'),
                        collection = JSON.parse(JSON.stringify(fixture)),
                        result     = handler(collection, {
                            route: '/some/path',
                            parent: {
                                template: {
                                    story: true
                                }
                            },
                            manifest: {
                                version: '1.0.0'
                            }
                        });

                    result = result.reduce(function (previous, current) {
                        var item = current.src || current.href || current;
                        previous.push(item);
                        return previous;
                    }, []);

                    should(result).eql(['a.css', 'a.js', 'b.js']);

                });

            });

        });

    });

});
