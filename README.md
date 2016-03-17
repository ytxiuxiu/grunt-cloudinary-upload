# grunt-cloudinary-upload

> Uploads images, fonts, css, js files wto Cloudinary which are referenced in html and css files, and also upgrade these references automatically!

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cloudinary-upload --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cloudinary-upload');
```

## The "cloudinary" task

### Overview
In your project's Gruntfile, add a section named `cloudinary` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  cloudinary: {
    options: {
      // Set your Cloudinary account info here
      account: {
        cloudName: 'your-cloud-name',
        apiKey: 'your-api-key',
        apiSecret: 'your-api-secret'
      }
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

You can also put your account info by using json in `cloudinary-account.json` file, rather than set it in `options` directively.

### Options

#### options.account
Type: `Object`
Default value: `{}`

A object contains your Cloudinary account info.

#### options.account.cloudName
Type: `String`
Default value: `null`

Your Cloud Name.

#### options.account.apiKey
Type: `String`
Default value: `null`

Your API Key.

#### options.account.apiSecret
Type: `String`
Default value: `null`

Your API Secret.

#### options.imageTypes
Type: `Array`
Default value: `['png', 'jpg', 'jpeg', 'gif']`

A array contains all extension names of images in your project. These kind of files will be uploaded to Cloudinary as an image. In another word, any other kind of files will be uploaded as raw file.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever, except the account info. So if the `testing` file has the content `url(../images/me.png)`, the generated result would be `url(http://res.cloudinary.com/your-cloud-name/image/upload/some-version/images/me.png)`.

Note: It is good to set `cwd` option and set it to a directory rather than a file, as it can remove the path of `cwd` in the url generated and it can not concat these files into one. In this example, if you do not set this parameter, the result would be `url(http://res.cloudinary.com/your-cloud-name/image/upload/some-version/path-to/images/me.png)`

```js
grunt.initConfig({
  cloudinary: {
    options: {
      account: {
        // Account info ...
      }
    },
    files: {
      cwd: 'src/',
      src: 'css/style.css',
      dest: 'dist/'
    },
  },
});
```

## Contributing
_(Nothing yet)_

## Release History
_(Nothing yet)_
