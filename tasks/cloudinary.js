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
  htmlImg: /<img[^\>]*[^\>\S]+src=['"]([^'"\)#]+)(#.+)?["']/gm,
  htmlScript: /<script.+src=['"]([^"']+)["']/gm,
  htmlLink: /<link[^\>]+href=['"]([^"']+)["']/gm
};

module.exports = function(grunt) {

  var replacements1 = [];
  var functions1 = [];
  var replacements2 = [];
  var functions2 = [];
  var files = this.files;

  function getSrc(match, pattern) {
    var src = match.replace(pattern, '$1');
    src = src.substring(0, src.indexOf('#') > 0 ? src.indexOf('#') : src.length);
    return src;
  }

  function addCssUrl(file, filepath, fileExtension, content) {
    // get all url(...) in css file
    var urls = content.match(patterns.cssUrl);
    if (urls) {
      urls.forEach(function(value) {
        // get url
        var src = getSrc(value, patterns.cssUrl);
        src = src.substring(0, src.indexOf('?') > 0 ? src.indexOf('?') : src.length);

        // get absolute path
        var absolute = uri(src).absoluteTo(filepath).toString();

        // add to replacements1
        replacements1.push({
          file: file,
          type: fileExtension,
          source: {
            match: value,
            src: src, // original url of source file which shows in file
            absolute: absolute, // absolute path of file which need to be uploaded
            result: null, // upload result from Cloudinary
            upload: true  // upload or not
          }
        });
      });
    }
  }

  function addHtmlImg(file, filepath, fileExtension, content) {
    var imgs = content.match(patterns.htmlImg);
    if (imgs) {
      imgs.forEach(function(value) {
        var src = getSrc(value, patterns.htmlImg);
        src = src.substring(0, src.indexOf('?') > 0 ? src.indexOf('?') : src.length);

        // get absolute path
        var absolute = uri(src).absoluteTo(filepath).toString();

        // add to replacements1
        replacements1.push({
          file: file,
          type: fileExtension,
          source: {
            match: value,
            src: src, // original url of source file which shows in file
            absolute: absolute, // absolute path of file which need to be uploaded
            result: null, // upload result from Cloudinary
            upload: true  // upload or not
          }
        });
      });
    }
  }

  function addHtmlScript(file, filepath, fileExtension, content) {
    var scripts = content.match(patterns.htmlScript);
    if (scripts) {
      scripts.forEach(function(value) {
        var src = getSrc(value, patterns.htmlScript);
        src = src.substring(0, src.indexOf('?') > 0 ? src.indexOf('?') : src.length);

        // get absolute path
        var absolute = uri(src).absoluteTo(filepath).toString();

        // add to replacements1
        replacements1.push({
          file: file,
          type: fileExtension,
          source: {
            match: value,
            src: src, // original url of source file which shows in file
            absolute: absolute, // absolute path of file which need to be uploaded
            result: null, // upload result from Cloudinary
            upload: true  // upload or not
          }
        });
      });
    }
  }

  function addHtmlLink(file, filepath, fileExtension, content) {
    var links = content.match(patterns.htmlLink);
    if (links) {
      links.forEach(function(value) {
        var src = getSrc(value, patterns.htmlLink);
        src = src.substring(0, src.indexOf('?') > 0 ? src.indexOf('?') : src.length);

        // get absolute path
        var absolute = uri(src).absoluteTo(filepath).toString();

        // add to replacements2
        replacements2.push({
          file: file,
          type: fileExtension,
          source: {
            match: value,
            src: src, // original url of source file which shows in file
            absolute: absolute, // absolute path of file which need to be uploaded
            result: null, // upload result from Cloudinary
            upload: true  // upload or not
          }
        });
      });
    }
  }

  function makeSameFileUnupload(replacements) {
    for (var i1 = 0; i1 < replacements.length; i1++) {
      var r1 = replacements[i1];
      for (var i2 = i1 + 1; i2 < replacements.length; i2++) {
        var r2 = replacements[i2];
        if (r1.source.absolute === r2.source.absolute) {
          replacements[i2].source.upload = false;
        }
      }
    }
  }

  function makeRemoteFileUnupload(replacements) {
    for (var i = 0; i < replacements.length; i++) {
      if (replacements[i].source.src.startsWith('http')) {
        replacements[i].source.upload = false;
      }
    }
  }

  function getPublicId(replacement, options) {
    var publicId = replacement.source.absolute;
    if (options.roots) {
      options.roots.forEach(function(root) {
        publicId = publicId.replace(root + 
          (root.endsWith('/') ? '' : '/'), '');
      });
      
    }
    return publicId.substring(0, publicId.indexOf('.'));
  }

  function getFileType(replacement, options) {
    var IMAGE_TYPES = options.imageTypes;
    var fileExtension = replacement.source.absolute.substring(
      replacement.source.absolute.lastIndexOf('.') + 1);
    for (var i = 0; i < IMAGE_TYPES.length; i++) {
      if (fileExtension === IMAGE_TYPES[i]) {
        return 'image';
      }
    }
    return 'raw';
  }

  function createfunctionsFromReplacements(replacements, functions, options) {
    replacements.forEach(function(replacement) {
      if (replacement.source.upload) {
        functions.push(function(callback) {
          grunt.log.writeln('   ' + 'uploading ' + replacement.source.absolute);

          // upload
          cloudinary.uploader.upload(replacement.source.absolute, function(result) {
            replacement.source.result = result;
            if (!result.error) {
              grunt.log.writeln('    ' + chalk.green('√') + ' uploaded ' + result.url);
            } else {
              grunt.log.writeln('    ' + chalk.red('×') + ' ' + 
                (result.error.message ? result.error.message : result.error));
            }
            callback(null, replacement);
          }, {
            public_id: getPublicId(replacement, options),
            replace: true,
            resource_type: getFileType(replacement, options)
          });
        });
      }
    });
  }

  grunt.registerMultiTask('cloudinary', 'Uploads image, font, css, js files wto Cloudinary which are referenced in html and css files, and also upgrade these references automatically!', function() {
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

    /* Phase 1 */
    grunt.log.writeln('Phase 1');

    // itearte all files which contain source files
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

        if (fileExtension === 'css') {
          addCssUrl(file, filepath, fileExtension, content);
        } else if (fileExtension === 'html' || fileExtension === 'htm') {
          addHtmlImg(file, filepath, fileExtension, content);
          addHtmlScript(file, filepath, fileExtension, content);
          addHtmlLink(file, filepath, fileExtension, content);
        } else {
          grunt.log.warn('File ' + filepath + ' ignored, as it is not a css/html file');
        }
      });
    });

    // do not upload same file
    makeSameFileUnupload(replacements1);

    makeRemoteFileUnupload(replacements1);

    // process html on the end
    // var htmls = [];
    // for (var i = 1; i < replacements1.length; i++) {
    //   for (var j = 0; j < replacements1.length - i; j++) {
    //     if (replacements1[j].type === 'htm' || replacements1[j].type === 'html') {
    //       var temp = replacements1[j + 1];
    //       replacements1[j + 1] = replacements1[j];
    //       replacements1[j] = temp;
    //     }
    //   }
    // }
    
    createfunctionsFromReplacements(replacements1, functions1, options);

    function replace(replacements, result) {
      // replace references
      grunt.log.writeln();
      grunt.log.writeln(' Replace references');

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
          grunt.log.writeln('   ' + chalk.green('file: ') + replacement.file.src + 
            chalk.green(' -> ') + replacement.file.dest);
          content = grunt.file.read(replacement.file.src);

          lastFile = replacement.file;
          lastSource = replacement.source;
        }

        if (isReplace) {
          // replace all
          if (replacement.source.src.startsWith('http')) {
            grunt.log.writeln('     ' + replacement.source.src + 
                chalk.red(' no change, not be uploaded'));
          } else {
            if (!replacement.source.result.error) {
              grunt.log.writeln('     ' + replacement.source.src + 
                chalk.green(' -> ') + replacement.source.result.url);
              
              content = content.replace(new RegExp(replacement.source.src, 'g'), 
                replacement.source.result.url);
            } else {
              grunt.log.writeln('     ' + replacement.source.src + 
                chalk.red(' no change, because of error'));
            }
          }
        }
      });
      grunt.file.write(lastFile.dest, content);
    }
    
    grunt.log.writeln(' Upload files');
    async.series(functions1, function(error, result) {
      replace(replacements1, result);

      /* Phase 2 */

      grunt.log.writeln();
      grunt.log.writeln('Phase 2');
      grunt.log.writeln(' Upload files');

      replacements2.forEach(function(replacement2) {
        replacements1.forEach(function(replacement1) {
          if (replacement2.source.absolute === replacement1.file.src[0]) {
            replacement2.source.absolute = replacement1.file.dest;
          }
          if (replacement2.file.src[0] === replacement1.file.src[0]) {
            replacement2.file.src[0] = replacement1.file.dest;
          }
        });
      });

      createfunctionsFromReplacements(replacements2, functions2, options);

      makeSameFileUnupload(replacements2);

      makeRemoteFileUnupload(replacements2);

      async.series(functions2, function(error, result) {
        replace(replacements2, result);

        done();
      });
    });
  });
  
};
