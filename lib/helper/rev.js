/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var path  = require('path'),
    util  = require('../util');

/**
 * @function rev
 * Iterates over a collection and revs a files name based upon
 * a manifest version
 *
 * @param {array}  collection the values to be processed
 * @param {object} data       an object providing, template, route & manifest
 *
 * @returns {array} the modified collection.
 */

module.exports = function(/* Array */ collection, /* Object */ data) {

    collection = collection.map(function (item) {

        var file    = item.src || item.href || item,
            extname = path.extname(file),
            key     = extname.replace(/\./g, '') === 'css' ? 'href' : 'src',
            value   = file.replace(extname, '_' + data.manifest.version.replace(/\./g, '') + extname);

        if (util._.isObject(item)) {
            item[key] = value;
        } else {
            item = value;
        }

        return item;

    });

    return collection;

};
