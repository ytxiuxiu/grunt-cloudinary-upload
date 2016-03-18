'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.cloudinary = {
  setUp: function(done) {
    done();
  },
  imageUrlInCss: function(test) {
    test.expect(1);

    var content = grunt.file.read('tmp/image_url_in_css.css');
    var urls = content.match(/url(?:\s+)?\(([^\)]+)\)/igm);
    var url = urls[0];
    if (url.startsWith('url(http://res.cloudinary.com')) {
      test.ok(true);
    } else {
      test.ok(false);
    }

    test.done();
  },
  witRootOption: function(test) {
    test.expect(1);

    var content = grunt.file.read('tmp/with_root_option.css');
    var urls = content.match(/url(?:\s+)?\(([^\)]+)\)/igm);
    var url = urls[0];
    if (url.endsWith('images/me.png)') && !url.endsWith('test/fixtures/images/me.png)')) {
      test.ok(true);
    } else {
      test.ok(false);
    }

    test.done();
  },
};
