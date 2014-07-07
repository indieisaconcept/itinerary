/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

var should = require('should'),
    util   = require('../../../lib/util');

/**
 * @function expected
 * Creates a test function based upon a key and array of
 * results
 *
 * @param {string} key          dot notation string
 * @param {array}  expected     collection of expected matches
 *
 * @returns {function}.
 */

exports.expected = function (key, expected) {

    return function (data) {

        data = util._.deepGet(data, key) || [];

        data = data.reduce(function (previous, current) {
            var item = current && current.src || current;
            previous.push(item);
            return previous;
        }, []);

        return should(data).eql(expected);

    };

};
