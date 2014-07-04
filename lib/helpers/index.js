/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var path    = require('path'),
    util    = require('../util'),
    helper  = {};

/**
 * @function rev
 * Iterates over a collection and revs a files name based upon
 * a manifest version
 *
 * @param {array}  collection the values to be processed
 * @param {object} template   an object detailing matching template conditions
 * @param {object} manifest   the original manifest as received
 * @param {string} route      the original manifest as received
 *
 * @returns {array} the modified collection.
 */

helper.rev = function(/* Array */ collection, /* Object */ template, /* Object */ manifest /* ... */) {

    collection = collection.map(function (item) {

        var file    = item.src || item.href || item,
            extname = path.extname(file),
            key     = extname.replace(/\./g, '') === 'css' ? 'href' : 'src',
            value   = file.replace(extname, '_' + manifest.version.replace(/\./g, '') + extname);

        if (util.isObject(item)) {
            item[key] = value;
        } else {
            item = value;
        }

        return item;

    });

    return collection;

};

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

helper.include = function (/* Array */ collection, /* Object */ template /* ... */) {

    collection = collection.filter(function (item) {

        var include = item.include,
            allow   = true;

        if (include) {

            allow = include.all || Object.keys(include).reduce(function (previous, current) {

                var value = template[current] && item.include[current];

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

/**
 * @function use
 * Provides an helpers loader which permits a series of helpers to be
 * run over a collection
 *
 * @param {array|string} helpers the helpers to run over a collection
 *
 * @returns {function} a helpers processor
 */

exports.use = function (/* String || Array */ helpers) {

    helpers = util.isString(helpers) && helpers.split(/[ ,]+/);
    helpers = util.isArray(helpers)  && helpers || [];

    // simple helper loader

    return function (/* String */ route, /* Array */ collection, /* String */ template, /* Object */ manifest) {

        helpers.forEach(function (name) {
            collection = helper[name](collection, template, manifest, route);
        });

        return collection;

    };

};

/**
 * @function register
 * Registers a helper function
 *
 * @param {string} name the helpers name
 * @param {function} handler the helpers handler
 *
 */

exports.register = function (/* String || Array */ name, /* Function */ handler) {

    if (!util.isString(name)) {
        throw new Error('You must specify a name to register a helper');
    }

    if (!util.isFunction(handler)) {
        throw new Error('You must specify a handler to register a helper');
    }

    if (helper[name]) {
        throw new Error(util.fmt('A helper with the name "%s" already exists', name));
    }

    helper[name] = handler;

};

exports.helper = helper;
