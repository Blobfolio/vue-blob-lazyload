# vue-blob-lazyload

`vue-blob-lazyload` is a very simple lazy-loading image plugin for [Vue.js](https://vuejs.org/) that supports both `src` and `srcset` attributes.

&nbsp;

## Table of Contents

 * [Installation](#installation)
 * [Usage](#usage)
 * [Styling](#styling)
 * [License](#license)

&nbsp;

## Installation

`vue-blob-lazyload` is compatible with all major modern web browsers and IE 11. Aside from Vue, there are no third-party requirements.

To install it, simply drop a link to the script in your code:
```html
<!-- The main Vue script. -->
<script src="vue.min.js"></script>
<!-- The lazy-loading plugin. -->
<script src="vue-blob-lazyload.min.js"></script>
<!-- Any other Vue code required by your program. -->
```

&nbsp;

## Usage

To make an image lazy-loadable, use the `v-lazy` directive as follows:

```html
<img v-lazy="{ options… }" height="100" width="100" alt="Example" />
```

Note: You do not need to include redundant HTML `src` or `srcset` attributes. The plugin will provide images with a small, transparent placeholder image source to prevent browser warnings.

There are three possible options.

| Type | Name | Description | Default |
| ---- | ---- | ----------- | ------- |
| *string* | **src** | An image URI, just like the regular attribute. | |
| *string* | **srcset** | A list of image URIs and widths, again, just like the regular attribute. | |
| *int* | **offset** | Image loading begins whenever an image is within this number of pixels from the current screen. | `450` |

Every `v-lazy` instance requires either an `src` or an `srcset` option. `offset` is optional.

&nbsp;

## Styling

If your project requires different styles for standard, lazy, and lazy-loaded images, you can make use of the `.is:lazy` and `.is:lazy-loaded` classes, which this plugin automatically applies to images under its care.

The former — `.is:lazy` — is added to `v-lazy` images during Vue setup. Once a true source has been loaded, that class is replaced with `.is:lazy-loaded`.

&nbsp;

## License

Copyright © 2018 [Blobfolio, LLC](https://blobfolio.com) &lt;hello@blobfolio.com&gt;

This work is free. You can redistribute it and/or modify it under the terms of the Do What The Fuck You Want To Public License, Version 2.

    DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
    Version 2, December 2004
    
    Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>
    
    Everyone is permitted to copy and distribute verbatim or modified
    copies of this license document, and changing it is allowed as long
    as the name is changed.
    
    DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
    TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
    
    0. You just DO WHAT THE FUCK YOU WANT TO.

### Donations

<table>
  <tbody>
    <tr>
      <td width="200"><img src="https://blobfolio.com/wp-content/themes/b3/svg/btc-github.svg" width="200" height="200" alt="Bitcoin QR" /></td>
      <td width="450">If you have found this work useful and would like to contribute financially, Bitcoin tips are always welcome!<br /><br /><strong>1Af56Nxauv8M1ChyQxtBe1yvdp2jtaB1GF</strong></td>
    </tr>
  </tbody>
</table>
