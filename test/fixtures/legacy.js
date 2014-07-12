/*
 * itinerary
 * http://github.com/indieisaconcept/itinerary
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var itinerary = require('../../'),
    util = require('../lib/util'),

    story = {
	src: 'story.js',
	include: {
	    story: true
	},
	global: true
    };

module.exports = {

    tests: [{
	description: "should return a config with global assets excluded",
	route: '/foo/exclude_page',
	expected: util.expected('config.assets.js', 'a.js b.js m.js n.js')
    }, {
	description: "should return a config for a vertical level including global assets",
	route: '/foo/vertical/buzz',
	expected: util.expected('config.assets.js', 'global.js i.js j.js k.js l.js')
    }, {
	description: "should return a config for a vertical level including only story global assets",
	route: '/foo/vertical/buzz/story-12345678-1234567891011',
	expected: util.expected('config.assets.js', 'global.js story.js i.js j.js k.js l.js')
    }, {
	description: "should return a config for a vertical level excluding global assets",
	route: '/foo/exclude_vertical/buzz',
	expected: util.expected('config.assets.js', 'i.js j.js k.js l.js')
    }],

    source: {

	route: {

	    config: {
		assets: {
		    js: [
			'a.js',
			'b.js', {
			    src: 'global.js',
			    global: true
			}
		    ].concat(story)
		}
	    },

	    foo: {
		config: {
		    assets: {
			js: ['c.js', 'd.js']
		    }
		},
		vertical: {
		    template: {
			vertical: true
		    },
		    config: {
			assets: {
			    js: ['i.js', 'j.js']
			}
		    },
		    buzz: {
			config: {
			    assets: {
				js: ['k.js', 'l.js']
			    }
			}
		    }
		},
		exclude_vertical: {
		    inherit: false,
		    template: {
			vertical: true
		    },
		    config: {
			assets: {
			    js: ['i.js', 'j.js']
			}
		    },
		    buzz: {
			config: {
			    assets: {
				js: ['k.js', 'l.js']
			    }
			}
		    }
		},
		exclude_page: {
		    inherit: false,
		    config: {
			assets: {
			    js: ['m.js', 'n.js']
			}
		    }
		}
	    }

	}

    },

    options: {
	helpers: {
	    'assets.js': itinerary.helper('include')
	},
	templates: {
	    story: /story-(.{8})-(\d{13})/
	}
    }

};
