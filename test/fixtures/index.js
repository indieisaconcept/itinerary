'use strict';

var boulevard = require('../../'),
    should    = require('should'),
    util      = require('../../lib/util'),

    fixture = {
        empty: {
            config: {},
            template: {}
        },
        source: {
            basic: {
                route: {
                    foo: {
                        config: {
                            assets: {
                                js: ['a.js', 'b.js']
                            }
                        }
                    }
                }
            }
        }
    };

module.exports = {

    // Each top level key will create a new boulevard processor for the
    // purpose of testing. Add processor specific tests under tests.

    simple: {

        tests: [
            {
                description: 'should return a config for a route that does exist',
                route: '/',
                expected: fixture.empty
            },
            {
                description: 'should return a config for a route that does not exist',
                route: '/some/path/that/does/not/exist',
                expected: fixture.empty
            },
            {
                description: 'should return a config for a for a child route',
                route: '/foo',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: ['a.js', 'b.js']
                        }
                    }
                }
            },
            {
                description: 'should return a config for a uri containing a route',
                route: 'http://www.domain.com.au/foo',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: ['a.js', 'b.js']
                        }
                    }
                }
            }
        ],

        source: fixture.source.basic

    },

    'file:json': {
         tests: [
            {
                description: 'should return a config from a .json manifest',
                route: '/foo',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: ['a.js', 'b.js']
                        }
                    }
                }
            }
         ],
         source: './test/fixtures/manifest.json'
    },

    'file:yaml': {
         tests: [
            {
                description: 'should return a config from a .yaml manifest',
                route: '/foo',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: ['a.js', 'b.js']
                        }
                    }
                }
            }
         ],
         source: './test/fixtures/manifest.yaml'
    },

    inherited: {

        tests: [
            {
                description: "should return a config for a single level of routes",
                route: '/foo',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: [
                                'a.js',
                                'b.js',
                                {
                                    src: 'global.js',
                                    global: true
                                },
                                'c.js',
                                'd.js'
                            ]
                        }
                    }
                }
            },
            {
                description: "should return a config for a second level of routes",
                route: '/foo/bar',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: [
                                'a.js',
                                'b.js',
                                {
                                    src: 'global.js',
                                    global: true
                                },
                                'e.js',
                                'f.js'
                            ]
                        }
                    }
                }
            },
            {
                description: "should return a config for a third level of routes",
                route: '/foo/bar/buzz',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: [
                                'a.js',
                                'b.js',
                                {
                                    src: 'global.js',
                                    global: true
                                },
                                'g.js',
                                'h.js'
                            ]
                        }
                    }
                }
            },
            {
                description: "should return a config for a vertical level",
                route: '/foo/vertical/buzz',
                expected: {
                    template: {
                        vertical: true
                    },
                    config: {
                        assets: {
                            js: ['i.js', 'j.js', 'k.js', 'l.js']
                        }
                    }
                }
            },
            {
                description: "should return a config for a vertical level including global assets",
                route: '/foo/vertical/buzz',
                expected: function (data) {

                    data = util._.deepGet(data, 'config.assets.js') || [];

                    var expected = ['global.js', 'i.js', 'j.js', 'k.js', 'l.js'];

                    data = data.reduce(function (previous, current) {
                        var item = current.src || current;
                        previous.push(item);
                        return previous;
                    }, []);

                    return should(data).eql(expected);

                }
            }
        ],

        source: {

            route: {

                config: {
                    assets: {
                        js: ['a.js', 'b.js', {
                            src: 'global.js',
                            global: true
                        }]
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
                    }
                }

            }

        },

        options: {
            helpers: {
                'assets.js': boulevard.helper('include')
            }
        }

    },

    // templates:
    // These are rules which are used to classify a route. These values,
    // can then be used for filtering. They can either be a regex or a
    // function

    template: {
        tests: [
            {
                description: 'should return template type based on template rule condition',
                route: 'foo/story-12345678-1234567891011',
                expected: {
                    template: {
                        story: true
                    },
                    config: {
                        assets: {
                            js: ['a.js', 'b.js']
                        }
                    }
                }
            }
        ],
        source: fixture.source.basic,
        options: {
            templates: {
                story: /story-(.{8})-(\d{13})/
            }
        }
    },

    // helper:
    // These are used to process a collection and modify or filter values as
    // required

    helper: {
        tests: [

            {
                description: 'should return a config for a route that has had it\'s collections modified by a helper',
                route: '/foo/story-12345678-1234567891011',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            css: ['a.css'],
                            js: ['a_010.js', 'b_010.js']
                        }
                    }
                }
            }

        ],
        source: {
            version: '0.1.0',
            route: {
                foo: {
                    config: {
                        assets: {
                            js: ['a.js', 'b.js'],
                            css: ['a.css', {
                                href: 'b.css',
                                include: {
                                    story: false
                                }
                            }],
                        }
                    }
                }
            }
        },
        options: {
            helpers: {
                'assets.js': boulevard.helper('rev'),
                'assets.css': boulevard.helper('include')
            }
        }
    }

};
