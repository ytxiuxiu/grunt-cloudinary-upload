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

var patterns = {
  cssUrl: /url\(\s*['"]?([^"'\)]+)["']?\s*\)/gm,
  htmlImg: /<img[^\>]*[^\>\S]+src=['"]([^'"\)#]+)(#.+)?["']/gm
};

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

        var fileExtension = filepath.substring(filepath.lastIndexOf('.') + 1);

        switch (fileExtension) {
          case 'css':
            // get all url(...) in css file
            var urls = content.match(patterns.cssUrl);
            urls.forEach(function(value) {
              // get url
              var url = value.replace(patterns.cssUrl, '$1');
              url = url.substring(0, url.indexOf('#') > 0 ? url.indexOf('#') : url.length);
              url = url.substring(0, url.indexOf('?') > 0 ? url.indexOf('?') : url.length);

              // get absolute path
              var absolute = uri(url).absoluteTo(filepath).toString();

              // add to replacements
              replacements.push({
                file: file,
                source: {
                  match: value,
                  src: url, // original url of source file which shows in file
                  absolute: absolute, // absolute path of file which need to be uploaded
                  result: null, // upload result from Cloudinary
                  upload: true  // upload or not
                }
              });
            });

            break;
          default:
            grunt.log.warn('File ' + filepath + ' ignored, as it is not a css/html file');
            break;
        }

        
      });
    });

    // do not upload same file
    for (var i1 = 0; i1 < replacements.length; i1++) {
      var r1 = replacements[i1];
      for (var i2 = i1 + 1; i2 < replacements.length; i2++) {
        var r2 = replacements[i2];
        if (r1.source.absolute === r2.source.absolute) {
          replacements[i2].source.upload = false;
        }
      }
    }

    var functions = [];
    replacements.forEach(function(replacement) {
      if (replacement.source.upload) {
        functions.push(function(callback) {
          grunt.log.writeln('   ' + 'uploading ' + replacement.source.absolute);

          // public id
          var publicId = replacement.source.absolute;
          if (options.root) {
            publicId = publicId.replace(options.root + (options.root.endsWith('/') ? '' : '/'), '');
          }
          publicId = publicId.substring(0, publicId.indexOf('.'));

          // result type
          var fileType = 'raw';
          var IMAGE_TYPES = options.imageTypes;
          var fileExtension = replacement.source.absolute.substring(replacement.source.absolute.lastIndexOf('.') + 1);
          for (var i = 0; i < IMAGE_TYPES.length; i++) {
            if (fileExtension === IMAGE_TYPES[i]) {
              fileType = 'image';
              break;
            }
          }

          // upload
          cloudinary.uploader.upload(replacement.source.absolute, function(result) {
            replacement.source.result = result;
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
          if (result[i2].source.absolute === replacements[i1].source.absolute && result) {
            replacements[i1].source.result = result[i2].source.result;
          }
        }
      }
      
      // replace all
      var lastFile = null;
      var lastSource = null;
      var content = null;
      replacements.forEach(function(replacement) {
        var isReplace = true;
        if (lastFile && replacement.file.src === lastFile.src) {
          if (lastSource && replacement.source.src === lastSource.src) {
            isReplace = false;
          } else {
            lastSource = replacement.source;
          }
        } else {
          // write last file
          if (lastFile) {
            grunt.file.write(lastFile.dest, content);
          }

          // open new file
          grunt.log.writeln('   ' + chalk.green('file: ') + replacement.file.src + chalk.green(' -> ') + replacement.file.dest);
          content = grunt.file.read(replacement.file.src);

          lastFile = replacement.file;
          lastSource = replacement.source;
        }

        if (isReplace) {
          // replace all
          if (!replacement.source.result.error) {
            grunt.log.writeln('     ' + replacement.source.src + chalk.green(' -> ') + replacement.source.result.url);
            
            content = content.replace(new RegExp(replacement.source.src, 'g'), replacement.source.result.url);
          } else {
            grunt.log.writeln('     ' + replacement.source.src + chalk.red(' no change, because of error'));
          }
        }
      });
      grunt.file.write(lastFile.dest, content);

      done();
    });
  });
};
