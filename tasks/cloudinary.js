/*
 * grunt-cloudinary-upload
 * https://github.com/xiuxiu/grunt-cloudinary-upload
 *
 * Copyright (c) 2016 Johnny Liu
 * Licensed under the MIT license.
 */

'use strict';

var chalk = require('chalk');
var path = require('path');
var uri = require('urijs');
var cloudinary = require('cloudinary');
var async = require('async');

module.exports = function(grunt) {

  grunt.registerMultiTask('cloudinary', 'Uploads images, fonts, css, js files wto Cloudinary which are referenced in html and css files, and also upgrade these references automatically!', function() {
    var options = this.options({
      imageTypes: [
        'png', 'jpg', 'jpeg', 'gif'
      ],
      account: grunt.file.readJSON('cloudinary-account.json')
    });

    var done = this.async();

    cloudinary.config({
      cloud_name: options.account.cloudName,
      api_key: options.account.apiKey,
      api_secret: options.account.apiSecret
    });

    // itearte all files which contain source files
    var replacements = [];
    this.files.forEach(function(file) {
      var src = file.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file ' + filepath + ' not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // read one file
        var content = grunt.file.read(filepath);

        // get all url(...) in css file
        var urls = content.match(/url(?:\s+)?\(([^\)]+)\)/igm);
        urls.forEach(function(value) {
          // get url
          var url = value.replace('url(', '').replace(')', '');
          url = url.substring(0, url.indexOf('#') > 0 ? url.indexOf('#') : url.length);
          url = url.substring(0, url.indexOf('?') > 0 ? url.indexOf('?') : url.length);

          // get absolute path
          var absolute = uri(url).absoluteTo(filepath).toString();

          // add to replacements
          replacements.push({
            file: file,
            src: filepath, // absolute path of file which contains sources files
            ori: value,
            url: url, // original url which shows in file
            absolute: absolute, // absolute path of file which need to be uploaded
            result: null, // upload result from Cloudinary
            upload: true  // upload or not
          });
        });
      });
    });

    // do not upload same file
    for (var i1 = 0; i1 < replacements.length; i1++) {
      var r1 = replacements[i1];
      for (var i2 = i1 + 1; i2 < replacements.length; i2++) {
        var r2 = replacements[i2];
        if (r1.absolute === r2.absolute) {
          replacements[i2].upload = false;
        }
      }
    }

    var functions = [];
    replacements.forEach(function(replacement) {
      if (replacement.upload) {
        functions.push(function(callback) {
          grunt.log.writeln('   ' + 'uploading ' + replacement.absolute);

          // public id
          var publicId = replacement.absolute;
          if (options.root) {
            publicId = publicId.replace(options.root + (options.root.endsWith('/') ? '' : '/'), '');
          }
          publicId = publicId.substring(0, publicId.indexOf('.'));

          // result type
          var fileType = 'raw';
          var IMAGE_TYPES = options.imageTypes;
          var fileExtension = replacement.absolute.substring(replacement.absolute.lastIndexOf('.') + 1);
          for (var i = 0; i < IMAGE_TYPES.length; i++) {
            if (fileExtension === IMAGE_TYPES[i]) {
              fileType = 'image';
              break;
            }
          }

          // upload
          cloudinary.uploader.upload(replacement.absolute, function(result) {
            replacement.result = result;
            if (!result.error) {
              grunt.log.writeln('    ' + chalk.green('√') + ' uploaded ' + result.url);
            } else {
              grunt.log.writeln('    ' + chalk.red('×') + ' ' + (result.error.message ? result.error.message : result.error));
            }
            callback(null, replacement);
          }, {
            public_id: publicId,
            replace: true,
            resource_type: fileType
          });
        });
      }
    });

    
    grunt.log.writeln('Upload files');
    async.series(functions, function(error, result) {
      // replace references
      grunt.log.writeln();
      grunt.log.writeln('Replace references');

      // match result to replacements
      for (var i1 = 0; i1 < replacements.length; i1++) {
        for (var i2 = 0; i2 < result.length; i2++) {
          if (result[i2].absolute === replacements[i1].absolute && result) {
            replacements[i1].result = result[i2].result;
          }
        }
      }
      
      // replace all
      replacements.forEach(function(replacement) {
        grunt.log.writeln('   ' + chalk.green('>') + ' ' + replacement.ori);
        if (!replacement.result.error) {
          grunt.log.writeln('   ' + '  to ' + replacement.result.url);
          var content = grunt.file.read(replacement.src);
          content = content.replace(replacement.url, replacement.result.url);
          grunt.file.write(replacement.file.dest, content);
        } else {
          grunt.log.writeln('   ' + '  no change, because of error');
        }
      });

      done();
    });
  });
};
