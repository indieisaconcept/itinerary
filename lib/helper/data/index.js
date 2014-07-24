/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var Handlebars  = require('handlebars'),
    util        = require('../../util'),
    helpers     = require('./helper'),
    cache       = {},
    helperCache = [],
    registerHelpers,
    template;

/*
 * @function registerHelpers
 * Register default handlebars helpers
 *
 * @param {object} helper   custom handlebar helpers
 */

registerHelpers = function (/* Object */ helpers) {

    var keys = Object.keys(helpers).filter(function (key) {
            return helperCache.indexOf(key) === -1;
        });

    keys.forEach(function (key) {
        Handlebars.registerHelper(key, helpers[key]);
    });

};

registerHelpers(helpers);

/**
 * @function template
 * Register, render and return a parsed template
 *
 * @param {string} template the values to be processed
 * @param {object} context  the data to pass to a template
 * @param {object} helpers  custom handlebar helpers
 * @param {number} level    running total of levels of resolution
 *
 * @returns {string} the modified value.
 */

template = function (/* String */ temp, /* Object */ context, /* Object */ helpers, /* Number */ level) {

    level = level && (level + 1) || 1;

    if (level === 1) {
        registerHelpers(helpers);
    }

    if (level === 3) {
        return temp;
    }

    var processor,
        result;

    if (cache[temp]) {
        processor = cache[temp];
    } else {
        processor = cache[temp] = Handlebars.compile(temp);
    }

    result = processor(context);

    return template(result, context, {}, level);

};

/**
 * @function data
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

    data = {
        m     : data.manifest,
        route : data.route,
        env   : data.env || ''
    };

    var context = this.context || {};

    collection = collection.map(function (item) {

        if (util._.isObject(item)) {

            Object.keys(item).forEach(function (key) {

                var tmp = item[key];

                if (util._.isString(tmp)) {
                    item[key] = template(tmp, data, context);
                }

            });

        } else {
            item = template(item, data, context);
        }

        return item;

    });

    return collection;

};
