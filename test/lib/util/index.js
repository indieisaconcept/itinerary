/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

exports.async = function (collection, iterator, callback) {

    var results = [],

        flow = function () {

            if (collection.length !== 0) {

                iterator(collection.shift(), function (err, data) {

                    if (err) {
                        console.error(err);
                    }

                    results.push(data);
                    flow();

                });

            } else {
                callback(null, results);
            }

        };

    flow();

};
