/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var combyne = require('combyne'),
    util    = require('../../util'),
    filters = require('./filters'),
    cache   = {},
    template;

/**
 * @function template
 * Register, render and return a parsed template
 *
 * @param {string} template the values to be processed
 * @param {object} context  the data to pass to a template
 * @param {number} level    running total of levels of resolution
 *
 * @returns {string} the modified value.
 */

template = function (/* String */ temp, /* Object */ context, /* Number */ level) {

    console.log(temp);

    level = level && (level + 1) || 1;

    if (level === 3) {
        return temp;
    }

    var processor,
        result;

    if (cache[temp]) {
        processor = cache[temp];
    } else {

        processor = cache[temp] = combyne(temp);

        Object.keys(filters).forEach(function (filter) {
            processor.registerFilter(filter, filters[filter]);
        });

    }

    result = processor.render(context);

    return template(result, context, level);

};

/**
 * @function template
 * Iterates over a collection and subsitutes template values found
 *
 * @param {array}  collection the values to be processed
 * @param {object} template   an object detailing matching template conditions
 * @param {object} manifest   the original manifest as received
 * @param {string} route      the original manifest as received
 *
 * @returns {array} the modified collection.
 */

module.exports = function(/* Array */ collection, /* Object */ data) {

    // setup context object for
    // use by templates

    var context = {
        m     : data.manifest,
        route : data.route,
        env   : data.env || ''
    };

    console.log(context.m.domains.cdn);

    collection = collection.map(function (item) {

        if (util._.isObject(item)) {

            Object.keys(item).forEach(function (key) {

                var tmp = item[key];

                if (util._.isString(tmp)) {
                    item[key] = template(tmp, context);
                }

            });

        } else {
            item = template(item, context);
        }

        return item;

    });

    return collection;

};
