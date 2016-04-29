# grunt-cloudinary-upload

> Uploads image, font, css, js files which are referenced in html and css files to Cloudinary, and also upgrades these references automatically! Supports Cloudinary Image Transformations.

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

## Tutorial

### Get a Cloudinary account

Cloudinary is a cloud-based service that provides an end-to-end image management solution including uploads, storage, administration, image manipulation, and delivery.

If you haven't got a Cloudinary account, please go to [here](https://cloudinary.com/users/register/free).

**Note**: Don't forget to verify your email address as it may cause an error later.

### The "cloudinary" task

In your project's Gruntfile, add a section named `cloudinary` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  cloudinary: {
    options: {
      // Set your Cloudinary account info here
      account: {
        cloudName: '<your-cloud-name>',
        apiKey: '<your-api-key>',
        apiSecret: '<your-api-secret>'
      }
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Set your Cloudinary account info

There are diffenert ways to set your Cloudinary account info, the first way is to put them in the `options` object directly.

```js
account: {
  cloudName: '<your-cloud-name>',
  apiKey: '<your-api-key>',
  apiSecret: '<your-api-secret>'
}
```

For security reason, you can also put your account info by using json in `cloudinary-account.json` file, rather than set it in `options` directively.

```json
{
  "cloudName": "<your-cloud-name>",
  "apiKey": "<your-api-key>",
  "apiSecret": "<your-api-secret>"
}
```

### Config your target

Please specify all the css and html files which contain references to resource files (including image, font, css, js files) in your target so that these resource files can be uploaded to Cloudinary.

**Note**: not the files you'd like to upload to Cloudinary, but the files contain references to the files you want to upload.

```js
your_target: {
  files: [{
    cwd: 'src/',
    src: ['css/**/*.css', '**/*.html'],
    dest: 'dist/' // Note: this must be a directory!
  }],
}
```

You don't need to worry about the order, it can be solved automatically. The whole process will be divided into 2 phases. In the first phase, images, fonts which are referenced in css file and images, js files which are referenced in the html file will be uploaded and the references will be updated. In the second phase, css files which have been altered in the first phase will be uploaded.

**Note**: the non-exist assests will be ignored by `grunt-cloudinary-upload`.

**Note**: the `dest` must be a directory unless you only have one file, as all the files matched `src` will be put into this directory.

### Support references

* `url` in css file
* `<link>` in html file
* `<img>` in html file
* `<script>` in html file

### Use Cloudinary Image Transformation

For Cloudinary Image Transformation usage, see [here](http://cloudinary.com/documentation/image_transformations).

You can simply add transformation chain after the `src` and a `?`.

There are some examples below:

```
url(../images/me.png?e_oil_paint/r_11)  // url in css
<img src="../images/me.png?e_oil_paint/r_11"> // img in html
```

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

For example, if you set this option, image file `dist/images/me.png` will be uploaded by `public_id = 'images/me'` instead of `public_id = 'dist/images/me'`. So that your url on Cloudinary will be `http://res.cloudinary.com/<cloud-name>/image/upload/v<version-number>/images/me.png` instead of `http://res.cloudinary.com/<cloud-name>/image/upload/v<version-number>/dist/images/me.png`

#### options.imageTypes
Type: `Array`
Default value: `['png', 'jpg', 'jpeg', 'gif']`

A array contains all extension names of images in your project. These kind of files will be uploaded to Cloudinary as an image (`resource_type = 'image'`). In another word, any other kind of files will be uploaded as raw file (`resource_type = 'raw'`). (See: [All upload options](http://cloudinary.com/documentation/node_image_upload#all_upload_options))

#### options.removeVersion
Type: `Boolean`
Default value: `false`

The version number will be removed in the url if this option is `true`.

For example, `http://res.cloudinary.com/<cloud-name>/image/upload/v<version-number>/images/me.png` will be replaced by `http://res.cloudinary.com/<cloud-name>/image/upload/images/me.png`.

### Usage Examples

#### Default Options
In this example, the `src/css/style.css` file has the content `url(../images/me.png)`, the generated result would be `url(http://res.cloudinary.com/<cloud-name>/image/upload/v<version-number>/src/images/me.png)`.

```js
grunt.initConfig({
  cloudinary: {
    options: {
      account: {
        // Account info ...
      }
    },
    css: {
      files: [{
        cwd: 'src/',
        src: ['css/style.css'],
        dest: 'dist/'
      }]
    }
  },
});
```

#### Remove Version
In this example, you can remove the `version` from the generated result. The `src/css/style.css` file has the content `url(../images/me.png)`, the generated result would be `url(http://res.cloudinary.com/<cloud-name>/image/upload/src/images/me.png)`.

```js
grunt.initConfig({
  cloudinary: {
    options: {
      removeVersion: true
    },
    css: {
      files: [{
        cwd: 'src/',
        src: ['css/style.css'],
        dest: 'dist/'
      }]
    }
  },
});
```

#### Multiple files
The example shows a relatively complex environment.

Your Gruntfile
```js
grunt.initConfig({
  cloudinary: {
    options: {
      removeVersion: true,
      roots: ['src/', 'dist/']
    },
    css: {
      files: [{
        cwd: 'src/',
        src: ['css/style.css', 'index.html'],
        dest: 'dist/'
      }]
    }
  },
});
```

The original files:

src/css/style.css
```css
div.sample {
  background: url(../images/me.png);
}
```

src/index.html
```html
<html>
  <head>
    <link rel="stylesheet" href="css/style.css">
  </head>
</html>
```

The generated files:

dist/css/style.css
```css
div.sample {
  background: url(http://res.cloudinary.com/<cloud-name>/image/upload/images/me.png);
}
```

dist/index.html
```html
<html>
  <head>
    <link rel="stylesheet" href="http://res.cloudinary.com/<cloud-name>/raw/upload/css/style.css">
  </head>
</html>
```

## Release History
**4.4.5**: Add 3-time retry during uploading
