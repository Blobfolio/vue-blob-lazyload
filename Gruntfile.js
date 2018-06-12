/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),

		// Javascript processing.
		eslint: {
			check: {
				src: ['src/js/*.js'],
			},
			fix: {
				options: {
					fix: true,
				},
				src: ['src/js/*.js'],
			}
		},

		uglify: {
			options: {
				mangle: false
			},
			my_target: {
				files: {
					'vue-blob-lazyload.min.js': ['src/js/vue-blob-lazyload.js'],
				}
			}
		},

		// File watcher.
		watch: {
			scripts: {
				files: ['src/js/*.js'],
				tasks: ['javascript', 'notify:js'],
				options: {
					spawn: false
				},
			}
		},

		// Notifications.
		notify: {
			js: {
				options: {
					title: "JS Files built",
					message: "Uglify and JSHint task complete"
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-notify');

	// Tasks.
	grunt.registerTask('default', ['javascript']);
	grunt.registerTask('javascript', ['eslint:check', 'uglify']);

	grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
	});
};
