/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var util    = require('../util'),
    cache   = require('requireindex')(__dirname),
    helper;

/**
 * @function helper
 * Registers or provides an helpers loader which permits a series
 * of helpers to be run over a collection
 *
 * @param {string} name the helpers name
 * @param {function} handler the helpers handler ( optional )
 *
 * Use:
 * @returns {function}  a helpers processor
 *
 * Register:
 * @returns {undefined}
 *
 */

helper = function (/* String || Array */ name, /* Function */ handler) {

    if (!util._.isString(name)) {
        throw new Error('You must specify a valid name to register or retrieve a helper');
    }

    var helpers,
        register = arguments.length === 2;

    if (register) {

        if (cache[name]) {
            throw new Error(util.fmt('A helper with the name "%s" already exists', name));
        }

        if (!util._.isFunction(handler)) {
            throw new Error('You must specify a handler to register a helper');
        }

        cache[name] = handler;

    } else {

        helpers = util._.isString(name)   && name.length > 0 && name.split(/[ ,]+/);
        helpers = util._.isArray(helpers) && helpers;

        return function (/* Array */ collection, /* Object */ options) {

            if (!helpers) {
                return collection;
            }

            helpers.forEach(function (name) {

                var handler = cache[name];

                collection = handler(collection, options);

            });

            return collection;

        };

    }

};

helper.registered = cache;
module.exports    = helper;
