/**
 * What Goes Around
 *
 * A dual-purpose visibility and lazy-loading plugin for Vue.js.
 *
 * @version 0.5.0
 * @author Blobfolio, LLC <hello@blobfolio.com>
 * @package vue-what-goes-around
 * @license WTFPL <http://www.wtfpl.net>
 *
 * @see https://blobfolio.com
 * @see https://github.com/Blobfolio/vue-what-goes-around
 */
(function() {

	// The plugin!
	const GoesAroundVue = {
		/**
		 * Install
		 *
		 * @param {Vue} Vue Vue.
		 * @returns {void} Nothing.
		 */
		install: function(Vue) {

			// ---------------------------------------------------------
			// Setup
			// ---------------------------------------------------------

			// A blank image source for lazy loading.
			const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';

			// Registered observers.
			var observersLazy = {};

			/**
			 * Lazy Loading Observer
			 *
			 * @param {array} entries Mutations.
			 * @param {MutationObserver} observerInstance Instance.
			 * @returns {void} Nothing.
			 */
			const observerLazy = function(entries, observerInstance) {
				for (let i = 0; i < entries.length; ++i) {
					// If it is on-screen, we should definitely run
					// our lazy-loading.
					let hit = (0 < entries[i].intersectionRatio);

					// But we also want to load anything *above* the
					// current screen. This doesn't happen often, but
					// if we didn't deal with it, it could cause weird
					// UX jumps as a user scrolls back to the top.
					if (!hit) {
						const rect = entries[i].target.getBoundingClientRect();
						if (
							('number' === typeof rect.top) &&
							0 > rect.top
						) {
							hit = true;
						}
					}

					// Lazy No More.
					if (hit) {
						// Remove this item from the observer.
						observerInstance.unobserve(entries[i].target);

						// Apply any attributes.
						if ('object' === typeof entries[i].target.__lazy_attr__) {
							const argsKeys = Object.keys(entries[i].target.__lazy_attr__);
							const argsLen = argsKeys.length;
							for (let j = 0; j < argsLen; ++j) {
								// Inline something?
								if ('inline' === argsKeys[j]) {
									_inlineSVG(entries[i].target.__lazy_attr__[argsKeys[j]], entries[i].target);
								}
								// Just a swap?
								else {
									entries[i].target.setAttribute(
										argsKeys[j],
										entries[i].target.__lazy_attr__[argsKeys[j]]
									);
								}
							}
							delete entries[i].target.__lazy_attr__;
						}

						// Mark it unlazy.
						entries[i].target.classList.add('is:lazy-loaded');
						entries[i].target.classList.remove('is:lazy');

						// Lastly if there's a callback, call it.
						if ('function' === typeof entries[i].target.__lazy_callback__) {
							entries[i].target.__lazy_callback__();
							delete entries[i].target.__lazy_callback__;
						}
					}
				}
			};

			/**
			 * Visibility Observer
			 *
			 * @param {array} entries Mutations.
			 * @param {MutationObserver} observerInstance Instance.
			 * @returns {void} Nothing.
			 */
			var observersScreen = new IntersectionObserver(
				function(entries) {
					for (let i = 0; i < entries.length; ++i) {
						let addClass = entries[i].isIntersecting ? 'on:screen' : 'off:screen';
						let removeClass = entries[i].isIntersecting ? 'off:screen' : 'on:screen';

						// Update the classes.
						if (!entries[i].target.classList.contains(addClass)) {
							entries[i].target.classList.add(addClass);
						}
						if (entries[i].target.classList.contains(removeClass)) {
							entries[i].target.classList.remove(removeClass);
						}

						// Execute the callback?
						if ('function' === typeof entries[i].target.__screen_callback__) {
							entries[i].target.__screen_callback__(entries[i].intersectionRatio);
						}
					}
				},
				{
					rootMargin: '0px',
					threshold: [
						0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1,
						0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2,
						0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.3,
						0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4,
						0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49, 0.5,
						0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.59, 0.6,
						0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69, 0.7,
						0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.8,
						0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89, 0.9,
						0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1.0,
					],
				}
			);

			// Default offset for lazy loading.
			const offset = '450px';

			// --------------------------------------------------------- end setup



			// ---------------------------------------------------------
			// Directives
			// ---------------------------------------------------------

			/**
			 * Directive: v-lazy
			 *
			 * Lazy loading directive.
			 */
			Vue.directive('lazy', {
				id: 'lazy',
				priority: 999999,
				/**
				 * Element with this directive has fully landed in the DOM.
				 *
				 * @param {DOMElement} el Element.
				 * @param {object} binding Vue data.
				 * @param {Vue} vnode Vue.
				 * @returns {void} Nothing.
				 */
				inserted: function(el, binding, vnode) {
					let rootMargin = offset;

					// Extend the element.
					el.__lazy_attr__ = {};

					// Make args easier to check.
					let args = binding.value || {};
					if (!args || ('object' !== typeof args)) {
						args = {};
					}

					// Loop through and see what we got.
					const argsKeys = Object.keys(args);
					const argsLen = argsKeys.length;
					for (let i = 0; i < argsLen; ++i) {
						// If the key is obviously bad, get rid of it.
						if (!/^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/.test(argsKeys[i])) {
							continue;
						}

						// Make sure the value is actually something we
						// want to look at.
						const valueType = typeof args[argsKeys[i]];
						if (
							('undefined' === valueType) ||
							('object' === valueType)
						) {
							continue;
						}

						switch (argsKeys[i]) {
						// Offset is special.
						case 'offset':
							if (/^-?[\d]+(px|%)/.test(args[argsKeys[i]])) {
								rootMargin = args[argsKeys[i]];
							}
							else {
								rootMargin = parseInt(args[argsKeys[i]]) || 0;
								rootMargin += 'px';
							}
							break;
						// So is callback.
						case 'callback':
							if ('function' === valueType) {
								// Call the callback in a callback so we
								// can scope it to the VM. Haha.
								el.__lazy_callback__ = function() {
									args[argsKeys[i]].call(
										vnode.context,
										el,
										binding.value
									);
								};
							}
							break;
						// Inline is not really a property either.
						case 'inline':
							if (
								('SVG' === el.tagName.toUpperCase()) &&
								('string' === valueType) &&
								args[argsKeys[i]]
							) {
								let url = _sanitizeUrl(args[argsKeys[i]]);
								if (url && /\.svg$/.test(url)) {
									el.__lazy_attr__.inline = url;
								}
							}
							break;
						// Everything else we just copy!
						default:
							// Copy anything else that's flat.
							if (
								('function' !== valueType) &&
								supportsAttr(el.tagName.toUpperCase(), argsKeys[i])
							) {
								el.__lazy_attr__[argsKeys[i]] = args[argsKeys[i]];
							}
						}
					}

					// Add a blank image? This is the only real hand-
					// holding the plugin offers.
					if (
						('IMG' === el.tagName.toUpperCase()) ||
						(
							('SOURCE' === el.tagName.toUpperCase()) &&
							el.parentNode &&
							('PICTURE' === el.parentNode.tagName.toUpperCase())
						)
					) {
						// Populate src attribute.
						if (!el.src && el.__lazy_attr__.src) {
							el.src = blank;
						}
						// Populate srcset attribute.
						if (!el.srcset && el.__lazy_attr__.srcset) {
							el.srcset = blank + ' 100w';
						}
					}

					// Get rid of our attributes if we aren't using
					// them.
					if (!Object.keys(el.__lazy_attr__).length) {
						delete el.__lazy_attr__;
					}

					// Start it lazy.
					el.classList.add('is:lazy');

					// Set up an observer with the right margin if
					// needed, otherwise we can just reuse an old one.
					if ('undefined' === typeof observersLazy[rootMargin]) {
						observersLazy[rootMargin] = new IntersectionObserver(
							observerLazy,
							{
								rootMargin: rootMargin,
								threshold: 0.01,
							}
						);
					}

					// Finally, observe it!
					Vue.nextTick(function() {
						observersLazy[rootMargin].observe(el);
					});
				},
			});

			/**
			 * Directive: v-screen
			 *
			 * Make it easier to tell when an element is on-screen.
			 */
			Vue.directive('screen', {
				id: 'screen',
				priority: 999999,
				/**
				 * Element with this directive has fully landed in the DOM.
				 *
				 * @param {DOMElement} el Element.
				 * @param {object} binding Vue data.
				 * @param {Vue} vnode Vue.
				 * @returns {void} Nothing.
				 */
				inserted: function(el, binding, vnode) {
					if ('object' === typeof binding.value) {
						// On-screen callback.
						if ('function' === typeof binding.value.callback) {
							// Call the callback in a callback so we
							// can scope it to the VM. Haha.
							el.__screen_callback__ = function(ratio) {
								binding.value.callback.call(
									vnode.context,
									el,
									ratio
								);
							};
						}
					}

					// Finally, observe it!
					Vue.nextTick(function() {
						observersScreen.observe(el);
					});
				},
			});

			// --------------------------------------------------------- end directives



			// ---------------------------------------------------------
			// Helpers
			// ---------------------------------------------------------

			/**
			 * Element Supports Attribute
			 *
			 * @param {string} tag Tag name.
			 * @param {string} attribute Attribute.
			 * @returns {bool} True/false.
			 */
			const supportsAttr = function(tag, attribute) {
				// Data attributes are always fine.
				if (/^data-[a-zA-Z\9-]+$/.test(attribute)) {
					return true;
				}

				// Create a quickie test element to see.
				const key = tag + '|' | attribute;
				if ('undefined' === typeof supportedAttr[key]) {
					let tmp = document.createElement(tag);
					supportedAttr[key] = (attribute in tmp);
				}

				return supportedAttr[key];
			};

			// Keep track of tag/attribute combinations we have checked.
			let supportedAttr = {};

			/**
			 * Async Fetch
			 *
			 * @param {string} url URL.
			 * @param {DOMElement} el Element.
			 * @returns {void} Nothing.
			 */
			const _inlineSVG = async function(url, el) {
				// This shouldn't have changed, but just in case.
				if ('SVG' !== el.tagName.toUpperCase()) {
					return;
				}

				const response = await fetch(url);
				let data = await response.text();

				// Ignore bad responses.
				if (!response.ok) {
					return;
				}

				// Parse it like it's hot.
				const parser = new DOMParser();
				const parsed = parser.parseFromString(data, 'image/svg+xml');

				// The file might contain other tags; we will pull data
				// from the first SVG found.
				if ('undefined' !== typeof parsed.children) {
					const parsedLen = parsed.children.length;
					for (let i = 0; i < parsedLen; ++i) {
						// We found it!
						if ('SVG' === parsed.children[i].tagName.toUpperCase()) {
							// Let's copy over attributes.
							const attr = parsed.children[i].attributes;
							const attrLen = attr.length;
							for (let j = 0; j < attrLen; ++j) {
								if (attr[j].specified) {
									// Merge classes.
									if ('class' === attr[j].name) {
										let classes = attr[j].value.replace(/\s+/g, ' ').trim().split(' ');
										for (let k = 0; k < classes.length; ++k) {
											el.classList.add(classes[k]);
										}
									}
									else {
										el.setAttribute(attr[j].name, attr[j].value);
									}
								}
							}

							// Transfer the innerHTML.
							el.innerHTML = parsed.children[i].innerHTML;
							break;
						}
					}
				}
			};

			/**
			 * Format URL
			 *
			 * @param {string} url URL.
			 * @returns {string} URL.
			 */
			const _sanitizeUrl = function(url) {
				let a = document.createElement('a');
				a.href = url;
				if (a.href) {
					return a.href;
				}
				return false;
			};

			// --------------------------------------------------------- end helpers

		},
	};

	// Hook the code into Vue.
	if ('undefined' !== typeof window && window.Vue) {
		window.Vue.use(GoesAroundVue);
	}

})();
