/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

// templates:
// These are rules which are used to classify a route. These values,
// can then be used for filtering. They can either be a regex or a
// function

module.exports = {
    tests: [{
        description: 'should return template type based on template rule condition',
        route: 'foo/story-12345678-1234567891011',
        expected: {
            template: {
                story: true
            },
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
    },
    options: {
        templates: {
            story: /story-(.{8})-(\d{13})/
        }
    }
};
