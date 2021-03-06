/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path'),

    expected = function( /* Array */ data) {

        return {
            config: {
                template: {},
                assets: {
                    js: data
                }
            }
        };

    };

module.exports = {
    tests: [{
        name: 'JSON',
        description: 'return a config from a manifest',
        route: '/foo',
        expected: expected(['a.js', 'b.js']),
        source: path.join(__dirname, './file/manifest.json')
    }, {
        name: 'YAML',
        description: 'return a config from a manifest',
        route: '/foo',
        expected: expected(['a.js', 'b.js']),
        source: path.join(__dirname, './file/manifest.yaml')
    }]
};
