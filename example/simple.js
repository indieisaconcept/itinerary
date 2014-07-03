/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var boulevard = require('../'),
    helpers   = require('../lib/helpers'),

    // boulevard supports an object being instead of a
    // file path

    processor = boulevard({
        route: {
            entertainment: {
                config: {
                    assets: {
                        js: ['a.js', 'b.js']
                    }
                }
            }
        }
    });

['/entertainment/story-fni0cx12-1226975734488'].forEach(function (item) {
    processor(item).on('data', function (err, data) {
        console.log(JSON.stringify(data, null, 4));
    });
});
