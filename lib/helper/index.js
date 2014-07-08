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
    cache   = {},
    helper,

    debug   = {
        include: util.debug('helper:include')
    };

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

cache.rev = function(/* Array */ collection, /* Object */ data) {

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

 cache.include = function (/* Array */ collection, /* Object */ data) {

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

            debug.include('inherit', inherit);

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

        helpers = util._.isString(name)    && name.split(/[ ,]+/);
        helpers = util._.isArray(helpers)  && helpers || [];

        return function (/* Array */ collection, /* Object */ options) {

            helpers.forEach(function (name) {

                var handler = cache[name],
                    isAsync = handler.length === 3; /*jshint unused: false */

                collection = handler(collection, options);

            });

            return collection;

        };

    }

};

helper.registered = cache;
module.exports    = helper;
