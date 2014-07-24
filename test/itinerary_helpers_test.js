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

describe('itinerary', function() {

    describe('[ HELPER ]', function () {

        it ('be a function', function () {
            var result = helper.should.be.a.Function;
        });

        it ('throw an error if a function or object is not passed as a second argument', function () {
            (function () {
                helper('nohandler', []);
            }).should.throw();
        });

        describe('[ USE ]', function () {

            it ('return a function if a single argument passed "helper helper"', function () {
                var result = helper('rev include').should.be.a.Function;
            });

            it ('throw an error if no name passed: helper()', function () {
                (function () {
                    helper();
                }).should.throw();
            });

        });

        describe('[ REGISTER ]', function () {

            it ('throw an error if a helper name is not a function when registering: helper([], [])', function () {
                (function () {
                    helper([], noop);
                }).should.throw();
            });

            it ('throw an error if a duplicate handler name is detected', function () {
                (function () {
                    helper('rev', noop);
                }).should.throw();
            });

            it ('register a helper function', function () {
                helper('mycustomhelper', noop);
                var result = helper.registered.mycustomhelper.should.be.a.Function;
            });

        });

        describe('[ REGISTERED ]', function () {

            it('not modify a collection if no helpers found', function () {

                var handler    = helper(''),
                    collection = JSON.parse(JSON.stringify(fixture)),
                    result     = handler(collection);

                should(result[0]).eql('a.css');

            });

            it('pass options to helpers', function (done) {

                var context    = { foo: 'bar' },
                    collection = JSON.parse(JSON.stringify(fixture)),
                    handler,
                    result;

                helper('custom', function () {
                    return should(this.context).eql(context) && done();
                });

                handler = helper('custom', {
                    custom: context
                });
                result = handler(collection);

            });

            describe('[ REV ]', function () {

                it('modify filename to include a version', function () {

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

                it('filter results based upon a set condition', function () {

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

            describe('[ DATA ]', function () {

                it('compile a string template', function () {

                    var handler    = helper('data'),
                        collection = ['{{m.version}}'],
                        result     = handler(collection, {
                            manifest: {
                                version: '1.0.0'
                            }
                        });

                    should(result[0]).eql('1.0.0');

                });

                it('compile an object with string templates', function () {

                    var handler    = helper('data'),
                        collection = [{
                            src: '{{m.version}}',
                            test: []
                        }],
                        result     = handler(collection, {
                            manifest: {
                                version: '1.0.0'
                            }
                        });

                    should(result[0].src).eql('1.0.0');

                });

                describe('[ HELPER ]',function () {

                    it('[ UPPERCASE ] return an uppercase value', function () {

                        var handler    = helper('data'),
                            collection = ['{{uppercase m.name}}', '{{uppercase m.test}}'],
                            result     = handler(collection, {
                                manifest: {
                                    name: 'itinerary',
                                    test: []
                                }
                            });

                        should(result[0]).eql('ITINERARY');
                        should(result[1]).eql('');

                    });

                    it('[ LOWERCASE ] return an lowercase value', function () {

                        var handler    = helper('data'),
                            collection = ['{{lowercase m.name}}', '{{lowercase m.test}}'],
                            result     = handler(collection, {
                                manifest: {
                                    name: 'ITINERARY',
                                    test: []
                                }
                            });

                        should(result[0]).eql('itinerary');
                        should(result[1]).eql('');

                    });

                    it('[ CUSTOM ] use a custom helper', function () {

                        var handler = helper('data', {
                                data: {
                                    reverse: function (val) {
                                        return typeof val === 'string' ? val.split('').reverse().join('') : val;
                                    }
                                }
                            }),

                            collection = ['{{reverse m.name}}', '{{lowercase m.test}}'],
                            result     = handler(collection, {
                                manifest: {
                                    name: 'ITINERARY',
                                    test: []
                                }
                            });

                        should(result[0]).eql('YRARENITI');
                        should(result[1]).eql('');

                    });

                });

            });

        });

    });

});
