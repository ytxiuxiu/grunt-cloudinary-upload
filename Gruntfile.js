/*
 * grunt-cloudinary-upload
 * https://github.com/xiuxiu/grunt-cloudinary-upload
 *
 * Copyright (c) 2016 Johnny Liu
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    cloudinary: {
      urlInCssTest: {
        options: {
          
        },
        files: {
          'tmp/css/image_url_in_css.css': 'test/fixtures/css/image_url_in_css.css'
        },
      },
      multipleUrlInCssTest: {
        files: {
          'tmp/css/multiple_url_in_css.css': 'test/fixtures/css/multiple_url_in_css.css'
        },
      },
      withRootOptionTest: {
        options: {
          roots: ['test/fixtures/']
        },
        files: {
          'tmp/css/with_root_option.css': 'test/fixtures/css/image_url_in_css.css'
        }
      },
      imageInHtmlTest: {
        files: {
          'tmp/index.html': 'test/fixtures/index.html'
        }
      },
      multipleFilesTest: {
        options: {
          roots: [
            'test/fixtures/',
            'tmp'
          ],
          removeVersion: true
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures/',
          src: ['**/*.html', '**/*.css'],
          dest: 'tmp/'
        }]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'cloudinary', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
