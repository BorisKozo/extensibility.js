/*global module*/
/*global require*/

// Generated on 2014-04-28 using generator-angular 0.8.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        meta: {
            pkg: grunt.file.readJSON('package.json'),
            app: 'app',
            dist: 'dist',
            version: '<%= meta.pkg.version %>',
            banner: '// <%= meta.pkg.name %> v<%= meta.version %>\n' +
            '// Copyright (c)<%= grunt.template.today("yyyy") %> Boris Kozorovitzky.\n' +
            '// Distributed under MIT license\n' +
            '// https://github.com/BorisKozo/extensibility.js.git' + '\n\n'
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= meta.app %>/lib/*.js'
            ]
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= meta.dist %>/*',
                        '!<%= meta.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        uglify: {
            standard: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    '<%= meta.dist %>/extensibility.min.js': ['<%= meta.dist %>/extensibility.js']
                }
            }
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: [
                    '<%= meta.app %>/lib/partials/header.jst',
                    '<%= meta.app %>/lib/events.js',
                    '<%= meta.app %>/lib/topological-sort.js',
                    '<%= meta.app %>/lib/boolean-phrase-parser.js',
                    '<%= meta.app %>/lib/app.js',
                    '<%= meta.app %>/lib/registry.js',
                    '<%= meta.app %>/lib/default-manifest.js',
                    '<%= meta.app %>/lib/addin.js',
                    '<%= meta.app %>/lib/builder.js',
                    '<%= meta.app %>/lib/service.js',
                    '<%= meta.app %>/lib/command.js',
                    '<%= meta.app %>/lib/condition.js',
                    '<%= meta.app %>/lib/manifest-reader.js',
                    '<%= meta.app %>/lib/partials/footer.jst'
                ],
                dest:'<%= meta.dist %>/extensibility.js'
            }

        }


    });

    grunt.registerTask('build', [
        'newer:jshint',
        'clean:dist',
        'concat:dist',
        'uglify:standard'
    ]);
};