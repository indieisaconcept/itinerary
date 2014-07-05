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

describe('boulevard helper', function() {

    it ('should be a function', function () {
        var result = helper.should.be.a.Function;
    });

    it ('should return a function if a single argument passed "helper helper"', function () {
        var result = helper('rev include').should.be.a.Function;
    });

    it ('should throw an error if no name passed: helper()', function () {
        (function () {
            helper();
        }).should.throw();
    });

    it ('should throw an error if a handler is not a function: helper("name", [])', function () {
        (function () {
            helper('nohandler', []);
        }).should.throw();
    });

    describe('register', function () {

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

    describe('rev', function () {

        it('should modify filename to include a version', function () {

            var handler    = helper('rev'),
                collection = JSON.parse(JSON.stringify(fixture)),
                result     = handler('/some/path', collection, {}, {
                    version: '1.0.0'
                });

            should(result[0]).eql('a_100.css');
            should(result[1].href).eql('b_100.css');
            should(result[2]).eql('a_100.js');
            should(result[3].src).eql('b_100.js');

        });

    });

    describe('include', function () {

        it('should filter results based upon a set condition', function () {

            var handler    = helper('include'),
                collection = JSON.parse(JSON.stringify(fixture)),
                result     = handler('/some/path', collection, {
                    story: true
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
