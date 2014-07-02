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

var processor = function (/* Object */ manifest, /* Object */ options) {

    var prefix    = options.prefix    || 'route',
        suffix    = options.suffix    || 'config',

        filters   = options.filters   || {},
        templates = options.templates || {},
        tplKeys   = Object.keys(templates),

    // create and cache template regex
    // if they exist

    templates = tplKeys.reduce(function (previous, current) {
        var item = templates[current];
        previous[current] = util.isString(item) ? new RegExp(item) : item;
        return previous;
     }, {});

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

                var current = util._.deepGet(value, key);

                if (current) {
                    util._.deepSet(value, key, filters[key](template, current, route, manifest));
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

module.exports = function (/* String */ file, /* Object */ options) {

    options = options || {};

    if (!file) {
        throw new Error('You must specify a manifest file to process.');
    }

    // return previously parsed manifest if
    // it exists

    if (cache[file]) {
        return cache[file];
    }

    var extension = npath.extname(file).substr(1),
        parser    = extension === 'yaml' ? YAML.load : JSON5.parse,
        manifest  = fs.existsSync(file) && parser(fs.readFileSync(file, 'utf8')); // support for JSON or YAML

    if (!manifest) {
        throw new Error(util.fmt('Manifest not found, %s.', file));
    }

    return cache[file] = processor(manifest, options);

};
