/*jshint -W068, unused: false */

'use strict';

var helpers = require('../lib/helpers'),
    should  = require('should'),

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
    ];

describe('boulevard helper', function() {

    it ('should be a function', function () {
        var result = helpers.should.be.a.Function;
    });

    it ('should be return a function', function () {
        var result = helpers('rev include').should.be.a.Function;
    });

    describe('rev', function () {

        it('should modify filename to include a version', function () {

            var helper     = helpers('rev'),
                collection = JSON.parse(JSON.stringify(fixture)),
                result     = helper('/some/path', collection, {}, {
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

            var helper     = helpers('include'),
                collection = JSON.parse(JSON.stringify(fixture)),
                result     = helper('/some/path', collection, {
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
