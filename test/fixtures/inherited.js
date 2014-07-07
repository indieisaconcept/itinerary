/*
 * boulevard
 * http://github.com/indieisaconcept/boulevard
 *
 * Copyright (c) 2014 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var boulevard = require('../../'),
    util      = require('../lib/util'),

    common = [
        'a.js',
        'b.js',
        {
            src: 'global.js',
            global: true
        }
    ];

module.exports = {

    tests: [{
        description: "should return a config for a single level of routes",
        route: '/foo',
        expected: {
            template: {},
            config: {
                assets: {
                    js: [].concat(common, ['c.js', 'd.js'])
                }
            }
        }
    }, {
        description: "should return a config for a second level of routes",
        route: '/foo/bar',
        expected: {
            template: {},
            config: {
                assets: {
                    js: [].concat(common, ['e.js', 'f.js'])
                }
            }
        }
    }, {
        description: "should return a config for a third level of routes",
        route: '/foo/bar/buzz',
        expected: {
            template: {},
            config: {
                assets: {
                    js: [].concat(common, ['g.js', 'h.js'])
                }
            }
        }
    }, {
        description: "should return a config for a vertical level including global assets",
        route: '/foo/vertical/buzz',
        expected: util.expected('config.assets.js', ['global.js', 'i.js', 'j.js', 'k.js', 'l.js'])
    }, {
        description: "should return a config for a vertical level excluding global assets",
        route: '/foo/exclude/buzz',
        expected: util.expected('config.assets.js', ['i.js', 'j.js', 'k.js', 'l.js'])
    }],

    source: {

        route: {

            config: {
                assets: {
                    js: [].concat(common)
                }
            },

            foo: {
                config: {
                    assets: {
                        js: ['c.js', 'd.js']
                    }
                },
                bar: {
                    config: {
                        assets: {
                            js: ['e.js', 'f.js']
                        }
                    },
                    buzz: {
                        config: {
                            assets: {
                                js: ['g.js', 'h.js']
                            }
                        }
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
                exclude: {
                    global: false,
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
                }
            }

        }

    },

    options: {
        helpers: {
            'assets.js': boulevard.helper('include')
        }
    }

};
