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
    url   = require('url'),
    ee    = require('events').EventEmitter,
    util  = require('./util'),

    // parsers

    JSON5 = require('json5'),
    YAML  = require('js-yaml'),

    oop   = {
        config: {},
        template: {}
    },

    processor, shouldInherit, helper;

/**
 * @function helper
 * Creates a helper function for processing collections
 *
 * @param {object} helpers  the helpers to run
 * @param {object} manifest the route manifest
 *
 * @returns {function}.
 */

helper = function (/* Object */ helpers, /* Object */ manifest) {

    var keys = Object.keys(helpers);

    return function (/* String */ route, /* String */ item, /* Boolean */ templates, /* Boolean */ inherit) {

         keys.forEach(function (key) {

            var value = util._.deepGet(item.config, key);

            if (value) {
                util._.deepSet(item.config, key, helpers[key](value, {
                    manifest: manifest,
                    parent: item,
                    route: route,
                    inherit: Boolean(inherit),
                    templates: templates
                }));
            }

         });

         return item;

    };

};

/**
 * @function shouldInherit
 * Enforces inheritance rules for configs across routes.
 *
 * @param {array} config a collection of configs
 * @param {array} key    a collection of route tokens
 *
 * @returns {boolean}.
 */

shouldInherit = function () {

    var vertical = 0;

    return function (config, key, current) {

        // determine if there is a vertical identified
        // within the config

        var cnd, temp;

        cnd = {
            root   : key.length === 0,                                         // top level global route
            end    : config.length === 0,                                      // the current route level
            vert   : (current.template || {}).vertical,                        // a detached route ( vertical )
            inherit: util._.isBoolean(current.inherit) ? current.inherit : true // can recieve root assets
        };

        // recursive vertical inheritance is not supported,
        // nor a warranted behaviour. Only one vertical is supported
        // in addition to the top level

        temp = {
            root    : cnd.root,
            inherit : cnd.inherit,
            config  : current.config   || {},
            template: current.template || {}
        };

        vertical += cnd.vert ? 1 : 0;

        if (cnd.root && vertical <= 1 || cnd.end || cnd.vert) {
            config.unshift(temp);
        }

        return vertical;

    };

};

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

processor = function (/* Object */ manifest, /* Object */ options) {

    var helpers     = helper(options.helpers   || {}, manifest),
        templates   = options.templates || {},

        rootInherit = false,
        tplKeys     = Object.keys(templates);

    // create and cache template regex
    // if they exist

    templates = tplKeys.reduce(function (previous, current) {
        var item = templates[current];
        previous[current] = util._.isString(item) && new RegExp(item) || item;
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

        route = url.parse(route, true);

        var inherit  = shouldInherit(),
            emmiter  = new ee(),
            key      = route.pathname || null,
            result   = {
                config: {},
                template: {}
            },
            config   = [],
            label, property, value, temp, isVertical;

        // check for template conditions

        tplKeys.forEach(function (key) {
            var item = templates[key];
            result.template[key] = util._.isRegExp(item) && item.test(route.pathname) ||
                            util._.isFunction(item) && item(route.pathname, templates);
        });

        // normalize keys for resolving, adding top-level
        // parent key

        key = key && key.replace(/(^\/)|(\/$)/g, '').split('/') || [];
        key = ['route'].concat(key);

        // retrieve assets

        while ( label = key.pop() ) {

            property = npath.join(key.join('/'), label).replace(/\//g, '.');
            value    = util._.deepGet(util._.cloneDeep(manifest), property);

            // ensure paths only inherit from
            // it's parent config and not it's
            // immediate parents pages

            if (value) {
                rootInherit = inherit(config, key, value);
            }

        }

        // merge configs together and remove duplicates

        result = config.reduce(function (previous, current) {

             current  = helpers(route, current, result.template, rootInherit);

             if (current.root || current.inherit) {
                delete current.root;
                delete current.inherit;
             }

            // console.log('before', previous.config.assets.js, current.config.assets.js);

            previous = util._.merge(previous, current, function(a, b) {
                return util._.isArray(a) ? a.concat(b) : undefined;
            });

            // console.log('after', previous.config.assets.js);

            return previous;

        }, result);

        setImmediate(function () {
            emmiter.emit('data', null, result);
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

    manifest = util._.isObject(manifest) ? manifest : fs.existsSync(manifest) && parser(fs.readFileSync(manifest, 'utf8')); // support for JSON or YAML

    if (!manifest) {
        throw new Error(util.fmt('Manifest not found, %s.', manifest));
    }

    return processor(manifest, options);

};
