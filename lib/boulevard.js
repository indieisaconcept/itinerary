/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var npath = require('path'),
    fs    = require('fs'),
    ee    = require('events').EventEmitter,
    util  = require('./util'),

    // parsers

    JSON5 = require('json5'),
    YAML  = require('js-yaml'),

    cache = {};

/**
 * @function processor
 * Creates a boulevard processor which is used to search for
 * a matching route
 *
 * @param {object} manifest the manifest of routes to traverse
 * @param {object} options  options to override boulevard defaults
 *
 * @returns {function} a route lookup.
 */

var processor = function (/* Object */ manifest, /* Object */ options) {

    var prefix    = options.prefix    || 'route',
        suffix    = options.suffix    || 'config',

	helpers   = options.helpers   || {},
        templates = options.templates || {},
        tplKeys   = Object.keys(templates);

    // create and cache template regex
    // if they exist

    templates = tplKeys.reduce(function (previous, current) {
        var item = templates[current];
        previous[current] = util.isString(item) ? new RegExp(item) : item;
        return previous;
     }, {});

    /**
     * @function
     * Traverses a manifest search for a match and then recursively
     * traverses back up the tree creating a asset dependency tree
     *
     * @param {string} route  the request path to search for
     *
     * @returns {function} an EventEmmitter,
     */

    return function (/* String */ route) {

        var emmiter  = new ee(),
            key      = route && route.length > 1 ? route : null,
            config   = [], label, property, value,
            template = {};

        // check for template conditions

        tplKeys.forEach(function (key) {
            var item = templates[key];
            template[key] = util.isRegExp(item) && item.test(route) ||
                            util.isFunction(item) && item(route, templates);
        });

        // normalize keys for resolving, adding top-level
        // parent key

        key = key && key.replace(/(^\/)|(\/$)/g, '').split('/');
        key = [prefix].concat(key || []);

        // retrieve assets

        while( label = key.pop() ) {

            property = npath.join(key.join('/'), label, suffix).replace(/\//g, '.');
            value    = util._.deepGet(manifest, property);

            // merge configs together and remove duplicates

            if (value) {
               config.unshift(value);
            }

        }

        // merge configs together and remove duplicates

        config = config.reduce(function (previous, current) {

             // apply filters against specific
             // config keys

             Object.keys(filters).forEach(function (key) {

                var value = util._.deepGet(current, key);

                if (current) {
                    util._.deepSet(current, key, filters[key](route, value, template, manifest));
                }

             });

             previous = util.merge(previous, current);

             return previous;

        }, {});

        setImmediate(function () {
            emmiter.emit('data', null, config);
        });

        return emmiter;

    };

};

/**
 * @function
 * Creates an instance of boulevard which is used to find assets for
 * a given path
 *
 * @param {string|object} manifest the manifest of routes to traverse
 * @param {object} options  options to override boulevard defaults
 *
 * @returns {function} the EventEmmitter, if found, otherwise undefined.
 */

module.exports = function (/* String || Object */ manifest, /* Object */ options) {

    options = options || {};

    if (!manifest) {
        throw new Error('You must specify a manifest to process.');
    }

    var extension = npath.extname(manifest).substr(1),
        parser    = extension === 'yaml' ? YAML.load : JSON5.parse;

    // use an object is passed first by default
    // then fallback to loading a file

    manifest = util.isObject(manifest) ? manifest : fs.existsSync(manifest) && parser(fs.readFileSync(manifest, 'utf8')); // support for JSON or YAML

    if (!manifest) {
        throw new Error(util.fmt('Manifest not found, %s.', manifest));
    }

    return processor(manifest, options);

};
