/**
 * Image Lazy Loading
 *
 * This is a Vue plugin for providing simple lazy loading.
 *
 * @version 0.2.0
 * @author Blobfolio, LLC <hello@blobfolio.com>
 * @package vue-blob-lazyload
 * @license WTFPL <http://www.wtfpl.net>
 *
 * @see https://blobfolio.com
 * @see https://github.com/Blobfolio/vue-blob-lazyload
 */
(function() {

	// The plugin!
	const BlobLazyloadVue = {
		/**
		 * Install
		 *
		 * @param {Vue} Vue Vue.
		 * @returns {void} Nothing.
		 */
		install: function(Vue) {

			// -------------------------------------------------------------
			// Setup
			// -------------------------------------------------------------

			// A blank image.
			const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';

			// Registered observers.
			var observers = {};

			/**
			 * Observer
			 *
			 * @param {array} entries Mutations.
			 * @param {MutationObserver} observerInstance Instance.
			 * @returns {void} Nothing.
			 */
			const observer = function(entries, observerInstance) {
				for (let i = 0; i < entries.length; ++i) {
					// A hit! Load the source and stop watching.
					if (0 < entries[i].intersectionRatio) {
						observerInstance.unobserve(entries[i].target);

						// Mark it unlazy.
						entries[i].target.classList.add('is:lazy-loaded');
						entries[i].target.classList.remove('is:lazy');

						// Sources.
						const lazySrc = entries[i].target.getAttribute('data-lazy-src') || '';
						const lazySrcset = entries[i].target.getAttribute('data-lazy-srcset') || '';

						// Apply source.
						if (lazySrc) {
							entries[i].target.src = lazySrc;
							entries[i].target.removeAttribute('data-lazy-src');
						}

						// Apply srcset.
						if (lazySrcset) {
							entries[i].target.srcset = lazySrcset;
							entries[i].target.removeAttribute('data-lazy-srcset');
						}
					}
				}
			};

			// Default offset.
			const offset = '450px';

			// ------------------------------------------------------------- end setup



			// -------------------------------------------------------------
			// Directives
			// -------------------------------------------------------------

			/**
			 * v-form
			 *
			 * The main form validation directive.
			 */
			Vue.directive('lazy', {
				id: 'lazy',
				priority: 999999,
				/**
				 * Element with this directive has fully landed in the DOM.
				 *
				 * @param {DOMElement} el Element.
				 * @param {object} binding Vue data.
				 * @returns {void} Nothing.
				 */
				inserted: function(el, binding) {
					let rootMargin = offset;

					// Were options passed?
					if ('object' === typeof binding.value) {
						// Look for a "src".
						if (
							('string' === typeof binding.value.src) &&
							binding.value.src
						) {
							el.setAttribute('data-lazy-src', binding.value.src);
							el.src = blank;
						}

						// Look for an "srcset".
						if (
							('string' === typeof binding.value.srcset) &&
							binding.value.srcset
						) {
							el.setAttribute('data-lazy-srcset', binding.value.srcset);
							el.srcset = blank + ' 100w';
						}

						// Figure out the offset.
						if ('undefined' !== typeof binding.value.offset) {
							if (/^-?[\d]+(px|%)/.test(binding.value.offset)) {
								rootMargin = binding.value.offset;
							}
							else {
								rootMargin = parseInt(binding.value.offset) || 0;
								rootMargin += 'px';
							}
						}
					}

					// Start it lazy.
					el.classList.add('is:lazy');

					// Set up an observer if necessary.
					if ('undefined' === typeof observers[rootMargin]) {
						observers[rootMargin] = new IntersectionObserver(
							observer,
							{
								rootMargin: rootMargin,
								threshold: 0.01,
							}
						);
					}

					// Finally, observe it!
					observers[rootMargin].observe(el);
				},
			});

			// ------------------------------------------------------------- end misc

		},
	};

	// Hook the code into Vue.
	if ('undefined' !== typeof window && window.Vue) {
		window.Vue.use(BlobLazyloadVue);
	}

})();
