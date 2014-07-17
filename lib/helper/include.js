/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var util  = require('../util'),
    debug = util.debug('helper:include');

/**
 * @function include
 * Ensures a value is only included if a series of conditions
 * is met
 *
 * @param {array}  collection the values to be processed
 * @param {object} template   an object detailing matching template conditions
 *
 * @returns {array} the modified collection.
 */

module.exports = function (/* Array */ collection, /* Object */ data) {

    var template = data.parent.template,
        uriTemp  = data.templates || {},
        inherit  = data.parent.inherit,
        isRoot   = data.parent.root;

    collection = collection.filter(function (item) {

        var include  = item.include,
            allow    = true;

        if (include) {

            // validate the correct template the item
            // should apply to

            allow = include.all || Object.keys(include).reduce(function (previous, current) {

                var value = template[current] && item.include[current] ||
                            uriTemp[current] && item.include[current];

                if (value) {
                    previous = value;
                }

                return previous;

            }, false);

        }

        // ensure that only global assets included if a root
        // object found

        if (isRoot) {

            debug('inherit', inherit);

            if (inherit === 'global') {
                allow = (allow && item.global);
            } else if (inherit === 'root') {
                allow = (allow && !item.global);
            }

        }

        return allow;

    });

    return collection;

};
