/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var npath   = require('path'),
    fs      = require('fs'),
    url     = require('url'),
    util    = require('./util'),

    // parsers

    JSON5   = require('json5'),
    YAML    = require('js-yaml'),

    // debuggers

    debug   = {
        info: util.debug(),
        route: util.debug('route'),
        process: util.debug('route:process'),
        inspect: util.debug('route:inspect')
    },

    isBool = util._.isBoolean,

    processor, inherits, helper, retrieve;

/**
 * @function helper
 * Creates a helper function for processing collections
 *
 * @param {object} helpers  the helpers to run
 * @param {object} manifest the route manifest
 *
 * @returns {function}.
 */

helper = function( /* Object */ helpers, /* Object */ manifest) {

    var keys = Object.keys(helpers);

    return function( /* String */ route, /* String */ item, /* Object */ templates) {

        keys.forEach(function(key) {

            var value = util._.deepGet(item.config, key);

            if (value) {
                util._.deepSet(item.config, key, helpers[key](value, {
                    manifest: manifest,
                    parent: item.config,
                    route: route,
                    templates: templates
                }));
            }

        });

        return item;

    };

};

/**
 * @function retrieve
 * Pluck specified config value
 *
 * @param {string} the config item to return
 *
 * @returns a value based on the key specified.
 */

retrieve = function(key) {

    if (!key) {
        return this;
    }

    // remove config from key if found

    key = key.split('.');
    key = (key[0] === 'config' ? key.slice(1) : key).join('.');

    return util._.deepGet(this, key);

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

inherits = function(config, key, current) {

    if (!current) {
        return;
    }

    // determine if there is a vertical identified
    // within the config

    var currConfig = current.config || {},
        cnd, temp, verts, citem, inherit, allow = false;

    cnd = {
        root : key.length === 0,                                         // top level global route
        end  : config.length === 0,                                      // the current route level
        vert : (current.template || currConfig.template || {}).vertical, // a detached route ( vertical )
    };

    // recursive vertical inheritance is not supported,
    // nor a warranted behaviour. Only one vertical is supported
    // in addition to the top level

    verts = config.filter(function(item) {
        item = item.config;
        return item.template && item.template.vertical;
    });

    inherit = isBool(currConfig.inherit) ? current.config.inherit : current.inherit;

    temp = {
        config: currConfig
    };

    // backwards compatibility tweaks.

    temp.config.inherit  = !cnd.root && isBool(inherit) ? inherit : true;
    temp.config.template = current.template || currConfig.template || {};

    // a) top level route & no vertical in the tree
    // b) first route in tree
    // c) only allow 1 vertical asset in a true

    allow = /* a: */ (cnd.root && verts.length === 0 ||
            /* b: */ cnd.end ||
            /* c: */ cnd.vert && verts.length === 0);

    // only inherit root route if a vertical.inherit has
    // not been set to false

    if (cnd.root) {

        temp.config.root = true;

        if (verts[0]) {
            allow = verts[0].config.inherit;
            temp.config.inherit = allow ? 'global' : 'none';
        } else {
            citem = config[config.length - 1] || {};
            temp.config.inherit = citem.config && citem.config.inherit ? 'all' : 'root';
        }

    }

    return allow && config.unshift(temp);

};

/**
 * @function processor
 * Creates a itinerary processor which is used to search for
 * a matching route
 *
 * @param {object} manifest the manifest of routes to traverse
 * @param {object} options  options to override itinerary defaults
 *
 * @returns {function} a route lookup.
 */

processor = function( /* Object */ manifest, /* Object */ options) {

    options.helpers = options.helpers || {};

    var helpers  = helper(options.helpers, manifest),
        tempTest = options.templates || options.template || {},
        tplKeys  = Object.keys(tempTest),
        cache    = {};

    // create and cache template regex
    // if they exist

    tempTest = tplKeys.reduce(function(previous, current) {
        var item = tempTest[current];
        previous[current] = util._.isString(item) ? new RegExp(item) : item;
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

    return function( /* String */ route, /* Function */ callback) {

        if (!util._.isString(route)) {
            return callback(new Error('A valid route is missing'));
        }

        if (!util._.isFunction(callback)) {
            throw new Error('A valid callback is missing');
        }

        if (cache[route]) {
            callback.apply(null, [null].concat(cache[route]));
        }

        var templates = {},
            result = {config:{}},
            config = [],
            label, property, value, key;

        route = url.parse(route, true);
        key   = route.pathname;

        debug.route(key);

        // check for template conditions

        tplKeys.forEach(function(key) {
            var item = tempTest[key];
            templates[key] = util._.isRegExp(item) && item.test(route.pathname) ||
                util._.isFunction(item) && item(route.pathname, manifest);
        });

        // normalize keys for resolving, adding top-level
        // parent key

        key = key && key.replace(/(^\/)|(\/$)/g, '').split('/');
        key = [manifest.route ? 'route': 'routes'].concat(key).filter(function(item) {
            return item.length > 0;
        });

        // retrieve assets

        while (label = key.pop()) {

            property = npath.join(key.join('/'), label).replace(/\//g, '.');

            debug.process(property);

            value = util._.deepGet(util._.cloneDeep(manifest), property);

            // ensure paths only inherit from
            // it's parent config and not it's
            // immediate parents pages

            inherits(config, key, value);

        }

        // merge configs together and remove duplicates

        result = config.reduce(function(previous, current) {

            current = helpers(route, current, templates);

            previous = util._.merge(previous, current, function(a, b) {
                return util._.isArray(a) ? a.concat(b) : undefined;
            });

            return previous;

        }, result);

        // clean up

        result.config.template = util._.merge(result.config.template, templates);

        delete result.config.root;
        delete result.config.inherit;

        debug.inspect(JSON.stringify(result, null, 4));

        cache[route] = [result, {
            get: retrieve.bind(result.config)
        }];

        callback.apply(null, [null].concat(cache[route]));

    };

};

/**
 * @function
 * Creates an instance of itinerary which is used to find assets for
 * a given path
 *
 * @param {string|object} manifest the manifest of routes to traverse
 * @param {object} options  options to override itinerary defaults
 *
 * @returns {function} the EventEmmitter, if found, otherwise undefined.
 */

module.exports = function( /* String || Object */ manifest, /* Object */ options) {

    options = options || {};

    if (!manifest) {
        throw new Error('You must specify a manifest to process.');
    }

    var extension = npath.extname(manifest).substr(1),
        parser = extension === 'yaml' ? YAML.load : JSON5.parse;

    // use an object is passed first by default
    // then fallback to loading a file

    manifest = util._.isObject(manifest) ? manifest : fs.existsSync(manifest) && parser(fs.readFileSync(manifest, 'utf8')); // support for JSON or YAML

    if (!manifest) {
        throw new Error(util.fmt('Manifest not found, %s.', manifest));
    }

    return processor(manifest, options);

};
