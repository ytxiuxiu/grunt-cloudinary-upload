# grunt-cloudinary-upload

> Uploads image, font, css, js files to Cloudinary which are referenced in html and css files, and also upgrade these references automatically!

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
Default value: `grunt.file.readJSON('cloudinary-account.json')`

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

#### options.roots
Type: `Array`
Default value: `null`

The root folders of your source files which will be uploaded. By setting this, it can remove the content of the option at the beginning of the `public_id` (See: [All upload options](http://cloudinary.com/documentation/node_image_upload#all_upload_options))

Note: Please set it both the path of your `src` folder and your `dest` folder, as the html file which contains references to css file, may upload from your dest folder rather than `src` folder.

```js
roots: [
  'src/',
  'dist/'
]
```

For example, if you set this option, image file `dist/images/me.png` will be uploaded by `public_id = 'images/me'` instead of `public_id = 'dist/images/me'`. So that your url on Cloudinary will be `http://res.cloudinary.com/cloud-name/image/upload/version-number/images/me.png` instead of `http://res.cloudinary.com/cloud-name/image/upload/version-number/dist/images/me.png`

#### options.imageTypes
Type: `Array`
Default value: `['png', 'jpg', 'jpeg', 'gif']`

A array contains all extension names of images in your project. These kind of files will be uploaded to Cloudinary as an image (`resource_type = 'image'`). In another word, any other kind of files will be uploaded as raw file (`resource_type = 'raw'`). (See: [All upload options](http://cloudinary.com/documentation/node_image_upload#all_upload_options))

#### options.removeVersion
Type: `Boolean`
Default value: `false`

The version number will be removed in the url if this option is `true`.

For example, `http://res.cloudinary.com/your-cloud-name/image/upload/some-version/images/me.png` will be replaced by `http://res.cloudinary.com/your-cloud-name/image/upload/images/me.png`.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever, except the account info. So if the `testing` file has the content `url(../images/me.png)`, the generated result would be `url(http://res.cloudinary.com/your-cloud-name/image/upload/some-version/path-to/images/me.png)`.

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
      dest: 'dist/' // Note: this must be a directory!
    },
  },
});
```

## Contributing
_(Nothing yet)_

## Release History
_(Nothing yet)_
