/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var boulevard = require('../'),

    // boulevard supports an object being instead of a
    // file path

    processor = boulevard( {
        version: '0.1.0',
        route: {
            foo: {
                config: {
                    assets: {
                        js: ['a.js', 'b.js'],
                        css: ['a.css', {
                            href: 'b.css',
                            include: {
                                story: false
                            }
                        }],
                    }
                }
            }
        }
    }, {

        helpers: {
            'assets.js': boulevard.helpers.use('rev'),
            'assets.css': boulevard.helpers.use('include')
        }

    });

['/entertainment/story-fni0cx12-1226975734488'].forEach(function (item) {
    processor(item).on('data', function (err, data) {
        console.log(JSON.stringify(data, null, 4));
    });
});
