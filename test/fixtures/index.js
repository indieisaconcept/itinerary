'use strict';

var boulevard = require('../../'),
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
                description: 'for a route that does exist',
                route: '/',
                expected: fixture.empty
            },
            {
                description: 'for a route that does not exist',
                route: '/some/path/that/does/not/exist',
                expected: fixture.empty
            },
            {
                description: 'for a child route',
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

        source: fixture.source.basic

    },

    inherited: {

        tests: [
            {
                description: "for a single level",
                route: '/foo',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: ['a.js', 'b.js', 'c.js', 'd.js']
                        }
                    }
                }
            },
            {
                description: "for a second level",
                route: '/foo/bar',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: ['a.js', 'b.js', 'e.js', 'f.js']
                        }
                    }
                }
            },
            {
                description: "for a third level",
                route: '/foo/bar/buzz',
                expected: {
                    template: {},
                    config: {
                        assets: {
                            js: ['a.js', 'b.js', 'g.js', 'h.js']
                        }
                    }
                }
            }
            // },
            // {
            //     description: "for a vertical level",
            //     route: '/foo/vertical/buzz',
            //     expected: {
            //         config: {
            //             assets: {
            //                 js: ['i.js', 'j.js', 'k.js', 'l.js']
            //             }
            //         }
            //     }
            // }
        ],

        source: {

            route: {

                config: {
                    assets: {
                        js: ['a.js', 'b.js']
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

        }

    },

    // templates:
    // These are rules which are used to classify a route. These values,
    // can then be used for filtering. They can either be a regex or a
    // function

    template: {
        tests: [
            {
                description: 'contains template object',
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
                description: 'for a route that has been modified by a helper',
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
    // },

    // advanced: {
    //     source: './test/fixtures/manifest.json'
    // }

};
