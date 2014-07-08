/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var util   = {
    fmt     : require('util').format,
    _       : require('lodash').runInContext(),
    debug   : function (/* String */ namespace) {
        var name = 'boulevard' + (namespace && ':' + namespace || '');
        return require('debug')(name);
    }
}

// Defaults

util._.mixin(require('lodash-deep'));

module.exports = util;
