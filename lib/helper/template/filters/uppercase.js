/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

/**
 * @function uppercase
 * Make a string uppercase
 *
 * @param {string}  val value to be processed
 *
 * @returns {string} the modified value.
 */

module.exports = function (val) {
    return typeof val === 'string' ? val.toUpperCase() : val;
};
