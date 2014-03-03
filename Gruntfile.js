'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'lib/**/*.js'],
            options: {
                node: true
            }
        },
        watch: {
            hint: {
                files: ['lib/**/*.js', 'test/**/*.js'],
                tasks: ['jshint', 'mochacli:test'],
                options: {
                    debouceDelay: 250
                }
            }
        },
        mochacli: {
            test: {
                options: {
                    reporter: 'spec'
                }
            },
            files: 'test/**/*.js'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('default', ['watch:hint']);
};
