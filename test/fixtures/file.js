/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = {
    tests: [{
        name: 'JSON',
        description: 'should return a config from a manifest',
        route: '/foo',
        expected: {
            template: {},
            config: {
                assets: {
                    js: ['a.js', 'b.js']
                }
            }
        },
        source: path.join(__dirname, './file/manifest.json')
    }, {
        name: 'YAML',
        description: 'should return a config from a manifest',
        route: '/foo',
        expected: {
            template: {},
            config: {
                assets: {
                    js: ['a.js', 'b.js']
                }
            }
        },
        source: path.join(__dirname, './file/manifest.yaml')
    }]
};
