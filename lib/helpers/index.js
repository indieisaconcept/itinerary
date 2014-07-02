/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

// rever:
// Rev a url based upon a version

exports.rever = function(item, version) {

    item = item.src ? item : {
        src: item
    };

    console.log(item);

    var extname = path.extname(item.src);

    item.src = item.src.replace(extname, '_' + version.replace(/\./g, '')) + extname;

    return item;

};

// include:
// Include a url based upon a condition

exports.include = function (item, condition) {

    var include = item.include,
        allow   = true;

    if (include) {

        allow = include.all || Object.keys(include).reduce(function (previous, current) {

            var value = condition[current];

            if (value) {
                previous = value;
            }

            return previous;

        }, false);

    }

    return allow;

};
