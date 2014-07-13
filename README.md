# Itinerary

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image] [![Coverage Status][coveralls-image]][coveralls-url]


Itinerary is a static asset manager. It's purpose is to simplify the management of CSS and JavaScript files and provide a means with which to abstract away resource configuration to avoid hard coded asset paths within a template.

Itinerary is not meant to replace your asset build pipeline, it's role is to provide a means to manage where these assets are included on your templates.

## Install

```bash
$ npm install --save itinerary
```

## Usage

Itinerary can either be used standalone or with Express.js.

**Common**

```javascript
var itinerary = require('itinerary'),
	itin      = itinerary('./path/to/manifest.yaml', options);
```

- *See manifests below for further detail on configuring Itinerary.*
- *See advanced below for further detail on configuring Itinerary via options.*


**Standalone**

```javascript
itin('/some/path/to/evalute', function (err, data, helper) {
	if (err) {
		throw new Error('An error has occurred');
	}
	// do something with data
});
```		

**Express Middleware**

```javascript
app.use(function (req, res, next) {

	itin(req.path, function (err, config, helper) {
	    if (err) {
	        return next(err);
	    }
	    res.locals.itinerary = helper;
	    next();
	});

));

```
- *See `./example/express` for a working example*

Itineray will return a processed manifest for the current route and a helper object which can be passed to your template engine. This helper can be used to access specific keys in the manifest.

```javascript
helper.get('config.assets.js');  // return JavaScript assets
helper.get('config.assets.css'); // return Stylesheet assets
helper.get('template'); 	 // return Template object
```

### Manifests

In order to use Itinerary, you must first define an asset manifest. This describes the static resources for a site.

Itinerary can be told about a manifest in two ways:

- a file path ( .json & .yaml supported ) or
- via an object literal passed directly

A typical Itinerary manifest can be seen below.

```javascript
{
    // Default information about the manifest
    "name": "Site",
    "version": "0.1.0",
    "description": "Asset manifest for static content and resources",
    
    // route: ( reserved )
    "route": {
    	"config": {
    		// global
    	},
        "foo": {
            // reserved keys:
            // template, config, inherit, root
            "config": {
                "assets": {
                    "js": ["a.js", "b.js"]
                }
            }
        }
    }
}
```

#### Routes

A route consists of a `config` key which can contain any number of children, a `template` key which can be used to describe the template the route supports or whether it is classified as a vertical and finally an `inherit` key which controls whether the route should inherit the root config assets. This key is only used when the `include` helper is used ( see advanced usage )

All other keys are considered to be a traversable route.

| Key           | Description                               | 
| ------------- |:-----------------------------------------:| 
| config        | The route configuration                   |
| template      | The template the route supports           |

##### Config

The config object can contain any number of items, Itinerary however needs to be told how it should process the values it finds within ( see advanced > helpers ).

Values within this config will be recursively merged together in the case of Objects and concat for Arrays. 

```javascript
'name': {
	config: {
		// add anything you wish here
	}
}
```

##### Template

An object literal which details the type of template a route identifies as. These values can be anything specific to your individual needs with the exception of the template type **vertical**.

A vertical is a convention introduced by Itinerary which essentially promotes a route to a root config. This means that routes below will only inherit assets from it's immediate parent route with a template type of vertical enabled and the route flagged as a vertical will not inherit the route config. The exception to this is when the include helper is in use.

```javascript
'name': {
	config: {
		template: {
			vertical: true,
			gallery: true
		}
	}
}
```
Review the advanced section below for more detail on templates.

## Advanced

Itinerary supports an options object passed when first called. This options object provides additional information to Itinerary which can be used during a routes processing.

### Templates

Templates is an object literal which can be set to determine a routes template type based upon defined conditions. This is useful when there are a large number of routes.

```javascript
var itinerary = require('itinerary'),
	itin      = itinerary('./path/to/manifest.yaml', {
	
        templates: {
            story   : /story-(.{8})-(\d{13})/,
            gallery : /gallery-(.{8})-(\d{13})/,
            homepage: function (/* String */ route) {
                return route.split('/').length <= 2;
            },
            section : function (/* String */ route, /* Object */ manifest) {
                return route.split('/').length >= 3 && !/story-(.{8})-(\d{13})/.test(route);
            }
        }

	});
```

A regular express can be used or alternatively a function. If using a function the original route and manifest are made available to the function.

### Helpers

A helper is used by Itinerary to control how config values it processes should be modified or organised. By default Itinerary comes bundle with two default helpers, rev which revs urls and include which provides more granular control over config inheritance.

#### Creating a helper

Helpers can be created by following the format below.

```javascript
Itinerary.helper('mycustomhelper', function (collection, data) {
	// Do something
	return collection
});

```

All helper functions have access to a collection which represents the data to process and a data object which provides access to the original manifest, the collections immediate parent, the route and a templates object.

#### Getting a helper

To access default helpers and any that you create you must specify a space or comma delimited string of the helpers you wish to use.

```javascript
Itinerary.helper('rev include');
```

#### Using a helper

In order to use helpers you must first tell Itinerary what helpers to use and what config keys to process. This is done via the initial option object.


```javascript
var itinerary = require('itinerary'),
	itin      = itinerary('./path/to/manifest.yaml', {
        helpers: {
            'assets.css': itinerary.helper('rev include'),
            'assets.js' : itinerary.helper('rev include')
        }
	});
```

Helpers will obtain it's collection to process based upon the key name passed within options, eg: `assets.css`. This key is resolved against a routes config object.

#### Default Helpers

***Collection***

```javascript
[ String, Object, String ]
```

The default helpers assume a collection item follows the following format, but the format can be anything provided your helper knows how to process it.

**String**

```javascript
path/to/asset.js
```

**Object**

```javascript
{
	src: 'path/to/asset.js',
	global: true | false
	
	// what templates should this asset be included upon
	
	include: {
		story: true,
		vertical: false
	}

}

```

##### rev

This helper will modify a files name based upon the version of a manifest. If the current manifest is at version 1.0.0 then the filename will be modified as follows.

- FROM: myfile.js
- TO: myfile_100.js

##### include

The include helper is used to control the behaviour of verticals, whether assets added at the manifest route should be added to all routes of a certain template type or even all.

When this helper is used routes which have been flagged with inherit false will not receive any global assets defined in the manifest route. All other routes will receive these assets provided the asset has its global flag set to true and the route template matches once of it's include conditions.



## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [gulp](http://gulpjs.com/).

## Release History

- **0.1.4** Keywords update

- **0.1.3**

    - template & inherit keys should now be added to config ( backwards compatibility added )
    - legacy tests added

- **0.1.2**

    - Renamed to itinerary
    - Added helper.get for use in template engines

- **0.1.1** Add missing package
- **0.1.0** Initial release


## License

Copyright (c) 2014 Jonathan Barnett. Licensed under the MIT license.

[npm-url]: https://npmjs.org/package/itinerary
[npm-image]: https://badge.fury.io/js/itinerary.svg
[travis-url]: https://travis-ci.org/indieisaconcept/itinerary
[travis-image]: https://travis-ci.org/indieisaconcept/itinerary.svg?branch=master
[daviddm-url]: https://david-dm.org/indieisaconcept/itinerary.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/indieisaconcept/itinerary
[coveralls-url]: https://coveralls.io/r/indieisaconcept/itinerary
[coveralls-image]: https://coveralls.io/repos/indieisaconcept/itinerary/badge.png
