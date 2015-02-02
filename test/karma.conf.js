module.exports = function (config) {
    config.set({

        basePath: '../',

        files: [
            {
                pattern: 'node_modules/chai/chai.js',
                include: true
            },
            {
                pattern: 'node_modules/sinon/pkg/sinon.js',
                include: true
            },
            'app/vendor/lodash.min.js',
            'app/vendor/promise-6.0.1.min.js',
            'test/test-header.js',
            'app/lib/events.js',
            'app/lib/topological-sort.js',
            'app/lib/app.js',
            'app/lib/registry.js',
            'app/lib/addin.js',
            'app/lib/builder.js',
            'app/lib/service.js',
            'app/lib/command.js',
            'app/lib/condition.js',
            'app/lib/default-manifest.js',
            'app/lib/manifest-reader.js',
            'test/unit/**/*.js'
        ],

        autoWatch: true,

        frameworks: ['mocha'],

        browsers: ['Chrome'],

        reporters: ['dots'],
        //reporters: ['dots', 'junit', 'coverage'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-mocha',
            'karma-junit-reporter',
            'karma-coverage'
        ],

        preprocessors: {
            'app/lib/*.js': 'coverage'
        },

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        },

        coverageReporter: {
            // cf. http://gotwarlost.github.com/istanbul/public/apidocs/
            type: 'lcov',
            dir: 'coverage/'
        }

    });
};