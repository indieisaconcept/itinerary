/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var empty = {
    config: {},
    template: {}
};

module.exports = {

    tests: [{
        description: 'should return a config for a route that does exist',
        route: '/',
        expected: empty
    }, {
        description: 'should return a config for a route that does not exist',
        route: '/some/path/that/does/not/exist',
        expected: empty
    }, {
        description: 'should return a config for a for a child route',
        route: '/foo',
        expected: {
            template: {},
            config: {
                assets: {
                    js: ['a.js', 'b.js']
                }
            }
        }
    }, {
        description: 'should return a config for a uri containing a route',
        route: 'http://www.domain.com.au/foo',
        expected: {
            template: {},
            config: {
                assets: {
                    js: ['a.js', 'b.js']
                }
            }
        }
    }],

    source: {
        route: {
            foo: {
                config: {
                    assets: {
                        js: ['a.js', 'b.js']
                    }
                }
            }
        }
    }

};
