/**
 * Created by Matthijs on 8-3-14.
 */

module.exports = function (grunt) {
    "use strict";

    // Configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Metadata
        meta: {
            jsPath: 'plc/js'
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %>-<%= pkg.version %> - <%= pkg.author %> <%= grunt.template.today("dd-mm-yyyy H:MM:ss") %> */\n'
            },
            js_files: {
                files: {
                    '<%= meta.jsPath %>/<%= pkg.name %>.min.js': '<%= meta.jsPath %>/<%= pkg.name %>.js'
                }
            }
        },
        watch: {
            src: {
                files: '<%= meta.jsPath %>/<%= pkg.name %>.js',
                tasks: ['uglify']
            }
        }
    });

    // Load plugins here
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Define your tasks here
    // register default task
    grunt.registerTask('default', 'Compress', function () {
        grunt.task.run('uglify');
    });

};