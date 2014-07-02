/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var util   = require('core-util-is');

util.fmt   = require('util').format;
util._     = require("lodash").runInContext();
util.merge = require('deepmerge');

// Defaults

util._.mixin(require("lodash-deep"));

module.exports = util;
