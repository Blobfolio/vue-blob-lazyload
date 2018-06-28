# What Goes Around

What Goes Around is a dual-purpose visibility and lazy-loading plugin for [Vue.js](https://vuejs.org/). It is lightweight (`~1.3KB` compressed), simple, and can be used to solve all kinds of different problems.

&nbsp;

## Table of Contents

* [Installation](#installation)
* [Lazy-Loading](#lazy-loading) 
* [On/Off Screen](#onoff-screen)
* [License](#license)

&nbsp;

## Installation

Aside from [Vue.js](https://vuejs.org/), there are no third-party requirements.

What Goes Around is compatible with all major modern web browsers.

This plugin will also work with ~~the browser that just won't die~~ IE 11 if you include an [polyfill](https://polyfill.io/v2/polyfill.min.js?features=es6,HTMLPictureElement,IntersectionObserver,IntersectionObserverEntry,fetch,Element.prototype.classList) like the one used in the demo.

This plugin does make use of some ES6 markup like `let` and `const`. If your project needs to support *old* browsers, you will need to first transpile `vue-what-goes-around.min.js` to ES5 with a tool like [Babel](https://babeljs.io/), then serve that copy to visitors.

To install it, simply drop a link to the script in your code:

```html
<!-- The main Vue script. -->
<script src="vue.min.js"></script>
<!-- The lazy-loading plugin. -->
<script src="vue-what-goes-around.min.js"></script>
<!-- Any other Vue code required by your program. -->
```

There are examples below, but you might also want to peek at the [demo](https://github.com/Blobfolio/vue-what-goes-around/blob/master/src/demo.html).

&nbsp;

## Lazy-Loading

Obviously, the most common use case for lazy-loading is saving bandwidth. You can, for example, delay the population of an image source (`src` or `srcset`) until the user has just about scrolled down to the element, that way they don't waste time downloading something they might never see.

But you can also use What Goes Around to delay loading *any* arbitrary — but browser-supported — attribute on *any* painted element on the page.

The magic is in the `v-lazy` directive:

```html
<!-- Delay loading an image source, for example. -->
<img v-lazy="{ src: 'img/something.jpeg' }" alt="Hello World" />

<!-- Same as above, but don't start loading until it
     is just off-screen. -->
<img v-lazy="{ src: 'img/something.jpeg', offset: 0 }" alt="Hello World" />

<!-- Pass it data you already set up in Vue. -->
<img v-lazy="myVueData" alt="Hello World" />

<!-- Add an arbitrary data attribute once this reaches
     the current screen. -->
<div v-lazy="{ 'data-hello': 'World' }">Hello World</div>
```

As with other Vue directives, you can pass arguments as vanilla JS (e.g. inline), or reference existing Vue data and/or methods.

### Arguments

There are three (optional) privileged arguments:

| Type | Name | Description |
| ---- | ---- | ----------- |
| *int* | **offset** | Lazy loading is triggered when an element is this number of pixels from the visible screen. If not supplied, `450px` is used. |
| *function* | **callback** | A callback function to execute once lazy-loading has commenced, called with the original Vue scope, and passed two arguments: the element and the arguments you passed in the first place. |
| *string* | **inline** | Lazy-load, parse, and inline an SVG. See the SVG section below for more information. |

Beyond that, the arguments may contain any number of `attribute: value` pairs, which will be magically set once lazy-loading has triggered. With the exception of HTML5 `data-xyz` attributes, the browser must recognize the attribute as part of the tag's prototype or it will be ignored.

**Note:** If you pass attributes to `v-lazy` that already exist on the element, those values will be *replaced* once lazy-loading runs.

If you need to do something weird (i.e. not handled by this plugin), just pass a `callback`.

### Images

If using this directive to lazy-load image sources for an `<img>` or `<picture>` element, you *do not* need to redundantly supply the HTML with `src` or `srcset` attributes. This plugin will automatically inject a transparent GIF as a placeholder to keep browsers happy.

You're welcome. :)

**Note:** If lazy-loading the sources for a `<picture>` element, you should apply separate `v-lazy` directives to each `<source>` and the `<img>` tag, otherwise strange and wild things might happen.

### SVG

One of the main benefits of the [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) "image" format is that it is code, and as such, can be styled with CSS and/or manipulated with Javascript.

But only if the SVG is inlined in the HTML document.

Inlining SVGs can have a major performance impact on your DOMReady and page load times, both because of the increased document size, but also because SVG markup really stresses encoders like Gzip and Brotli.

What Goes Around includes an experimental `inline` option you can use to point an `<svg>` element to an external source. Once lazy loading triggers, that remote file will be downloaded and parsed, its attributes and childNodes copied over to the target element. Remote attribute values take priority — they'll blow away your local ones — however classes will be merged.

Let's look at an example:

```html
<!-- Start with an empty <svg> on the page with a v-lazy
     directive. -->
<svg v-lazy="{ inline: 'http://domain.com/image.svg' }"></svg>

<!-- When Vue mounts, the DOM will show this: -->
<svg class="is:lazy"></svg>

<!-- Once the lazy loading has finished, you'll get this: -->
<svg width="50" height="50" viewbox="0 0 50 50" class="is:lazy-loaded" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor">…
</svg>
```

Once inserted, the browser should treat it like it was always there, applying any styles, etc. With that in mind, try not to link to malicious sources, because bad things could happen once they're loaded into the page. Haha.

This feature requires browser support for `fetch()` and ES6 promises. To make it work in IE, you'll also need a `classList` polyfill as for some reason that browser does not support classLists on SVG elements. Haha.

### Classes

This directive applies two state classes to bound elements: `is:lazy` and `is:lazy-loaded`. The former is added during Vue setup, and is replaced with the latter as soon as lazy-loading has triggered.

While the plugin does not use either of these for rendering styles, you may certainly do so as desired.

&nbsp;

## On/Off Screen

For reasons that are unclear, HTML/CSS does not provide a simple way to determine if an element is actually on the damn screen at any given moment. To fix that, you can use the `v-screen` directive.

```html
<!-- Keep track of where this is. -->
<div v-screen>Hello World</div>

<!-- Same as above, but also fire a callback whenever
     visibility changes. -->
<div v-screen="{ callback: myCallback }">Hello World</div>

<!-- Pass it data you already set up in Vue. -->
<div v-screen="myVueData">Hello World</div>
```

As with other Vue directives, you can pass arguments as vanilla JS (e.g. inline), or reference existing Vue data and/or methods.

### Arguments

| Type | Name | Description |
| ---- | ---- | ----------- |
| *function* | **callback** | A callback function to execute whenever the amount of screen visibility changes, called with the original Vue scope, and passed two arguments: the element and the visibility ratio (a *float* between `0` and `1`). |

```js
/**
 * Example Callback
 *
 * @param {DOMElement} el Element.
 * @param {float} ratio Ratio.
 * @returns {void} Nothing.
 */
function myVisibilityCallback(el, ratio) {
  // Element is off-screen.
  if (ratio <= 0) {
    this.visibilityState = 'off';
  }
  // Element is partially visible.
  else if (ratio < 1) {
    this.visibilityState = 'partial';
  }
  // Element is fully contained within the screen.
  else {
    this.visibilityState = 'on';
  }
}
```

### Classes

This directive applies two state classes to bound elements: `on:screen` and `off:screen`. As you might expect, `on:screen` exists whenever any portion of an element is visible on the current screen, otherwise it gets the `off:screen` class.

While the plugin does not use either of these for rendering styles, you may certainly do so as desired.

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
