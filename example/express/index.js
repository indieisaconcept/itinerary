/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var path       = require('path'),
    express    = require('express'),
    boulevard  = require('../../'),
    blvd       = boulevard('./manifest.yaml'),

    /**
     * @function middleware
     * Express middleware wrapper for boulevard
     * processor
     */

    middleware = function (req, res, next) {

        blvd(req.path, function (err, document) {

            if (err) {
                return next(err);
            }

            res.locals.boulevard = document;
            console.log('middle', document);

            next();

        });

    },

    app = express();

// default application configuration

app.use(express.static(path.join(__dirname, '/public')));
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, '/views'));

// Ignore favicon routes

app.get('/favicon.ico', function (req, res) {
    res.set('Content-Type', 'image/x-icon');
    res.send(200);
    return;
});

// Wildcard route for testing

app.get('*', middleware, function(req, res){
    res.render('index', {
        path: req.path
    });
});

app.listen(3000);
