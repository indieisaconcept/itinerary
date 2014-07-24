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
        context,
        invalid,
        register = util._.isFunction(handler);

    if (register) {

        if (cache[name]) {
            throw new Error(util.fmt('A helper with the name "%s" already exists', name));
        }

        cache[name] = handler;

    } else {

        invalid = handler && !util._.isObject(handler) || util._.isArray(handler);

        if (invalid) {
            throw new Error('Invalid arguments passed');
        }

        context = handler || {};
        helpers = util._.isString(name)   && name.length > 0 && name.split(/[ ,]+/);
        helpers = util._.isArray(helpers) && helpers;

        return function (/* Array */ collection, /* Object */ options) {

            if (!helpers) {
                return collection;
            }

            helpers.filter(function (name) {
                return util._.isFunction(cache[name]);
            }).forEach(function (name) {
                var handler = cache[name];

                // apply context for handler
                // based on passed in options

                collection = handler.apply({
                    context: context[name]
                }, [collection, options]);

            });

            return collection;

        };

    }

};

helper.registered = cache;
module.exports    = helper;
