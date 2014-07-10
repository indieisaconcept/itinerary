/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

module.exports = {

    tests: [{
        description: 'should return a config for a root route',
        route: '/',
        expected: {
            template: {},
            config: {
                assets: {
                    js: ['1.js', '2.js']
                }
            }
        }
    }, {
        description: 'should return a config for a route that does not exist',
        route: '/some/path/that/does/not/exist',
        expected: {
            template: {},
            config: {
                assets: {
                    js: ['1.js', '2.js']
                }
            }
        }
    }, {
        description: 'should return a config for a for a child route',
        route: '/foo',
        expected: {
            template: {},
            config: {
                assets: {
                    js: ['1.js', '2.js', 'a.js', 'b.js']
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
                    js: ['1.js', '2.js', 'a.js', 'b.js']
                }
            }
        }
    }],

    source: {
        route: {
            config: {
                assets: {
                    js: ['1.js', '2.js']
                }
            },
            foo: {
                config: {
                    assets: {
                        js: ['a.js', 'b.js']
                    }
                }
            }
        }
    },

    expected: {
        template: {},
        config: {
            assets: {
                js: ['1.js', '2.js']
            }
        }
    }

};
