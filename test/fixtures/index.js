'use strict';

module.exports = {

    simple: {
        source: {
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
    },

    inherited: {

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
                    }
                }

            }
        },

        expected: {

            config: {
                assets: {
                    js: ['a.js', 'b.js', 'c.js', 'd.js']
                }
            }

        }

    },

    advanced: {
        source: './test/fixtures/manifest.json'
    }
};
