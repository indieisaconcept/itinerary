/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var util   = {
    fmt     : require('util').format,
    _       : require('lodash').runInContext(),

    /**
     * @function debug
     * Creates a namespaced debug function
     *
     * @param {string} namespace the name of the debug topic
     *
     * @returns {function}
     */

    debug   : function (/* String */ namespace) {
        var name = 'itinerary' + (namespace && ':' + namespace || '');
        return require('debug')(name);
    }
};

// Defaults

util._.mixin(require('lodash-deep'));

module.exports = util;
