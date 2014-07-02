/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path'),
    util = require('../util'),
    helper = {};

// rever:
// Rev a url based upon a version

helper.rev = function(collection, template, manifest) {

    collection.map(function (item) {

        var file    = item.src || item.href || item,
            extname = path.extname(item),
            key     = extname.replace(/\./g, '') === 'css' ? 'href' : 'src',
            temp    = {};

        if (!util.isObject(item)) {
            temp[key] = item;
            item      = temp;
        }

        item[key] = item[key].replace(extname, '_' + manifest.version.replace(/\./g, '') + extname);

        console.log(item);

        return item;

    });

    return collection;

};

// include:
// Include a url based upon a condition

helper.include = function (collection, template, manifest) {

    collection.filter(function (item) {

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

    });

    return collection;

};

module.exports = function (helpers) {

    helpers = helpers && util.isString(helpers) ? helpers.split(/[ ,]+/) : helpers;
    helpers = helpers || [];

    return function (/* String */ route, /* Array */ collection, /* String */ template, /* Object */ manifest) {

        helpers.forEach(function (name) {
            collection = helper[name](collection, template, manifest, route);
        })

        return collection;

    };

};
