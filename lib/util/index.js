/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var util   = {
    fmt: require('util').format,
    _  : require("lodash").runInContext()
}

// Defaults

util._.mixin(require("lodash-deep"));

module.exports = util;
