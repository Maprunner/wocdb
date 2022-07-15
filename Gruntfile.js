module.exports = function (grunt) {
  var jsFileList = ['js/wocdb.js', 'js/models/activewoc.js', 'js/models/woc.js', 'js/models/race.js', 'js/models/result.js', 'js/collections/wocs.js', 'js/collections/races.js',
    'js/collections/raceresult.js', 'js/views/active-woc-view.js', 'js/views/wocdb-view.js', 'js/views/result-view.js', 'js/utils.js', 'js/views/person-view.js',
    'js/views/race-result-view.js', 'js/views/race-header-view.js', 'js/views/race-menu-view.js', 'js/routers/router.js', 'js/collections/person.js', 'js/views/master-view.js',
    'js/models/runner.js', 'js/collections/runners.js', 'js/views/runners-view.js', 'js/models/best.js', 'js/collections/bestlist.js', 'js/views/best-view.js',
    'js/collections/countries.js', 'js/models/medal.js', 'js/collections/medals.js', 'js/views/medals-view.js'];

  var cssFileList = ['css/wocdb.css'];

  var jsConcatFile = 'js/wocdb.all.js';

  var jsMinFile = 'js/wocdb.min.js';

  var relDir = 'ftpsite/';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      js: {
        src: jsFileList,

        dest: jsConcatFile,

        options: {
          banner: '// Version <%= pkg.version %> <%= grunt.template.today("isoDateTime") %>;\n'

        }
      }
    },

    jshint: {
      options: {
        curly: true,
        plusplus: true,
        strict: true,
        undef: true,
        unused: true,
        trailing: true,
        globals: {
          $: false,
          Backbone: false,
          _: false,
          window: false,
          document: false,
          alert: false,
          FileReader: false,
          console: false,
        }
      },
      all: {
        src: jsFileList
      }
    },

    csslint: {
      options: {
        // 2 means treat as an error
        'import': 2,
        // false means ignore rule
        // TODO: rewrite CSS to allow these to be removed, but for now it works
        'ids': false,
        'box-model': false,
        'duplicate-background-images': false,
        'outline-none': false,
        'order-alphabetical': false,
        'adjoining-classes': false
      },
      src: cssFileList
    },

    uglify: {
      options: {
        banner: '// Version <%= pkg.version %> <%= grunt.template.today("isoDateTime") %>;\n'
      },
      build: {
        src: jsConcatFile,
        dest: jsMinFile
      }
    },

    clean: {
      minified: [jsConcatFile, jsMinFile]
    }

  });

  // Load all the grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['build']);

  // grunt.registerTask('build', ['clean:minified', 'jshint:all', 'concat:js', 'uglify']);
  grunt.registerTask('build', ['clean:minified', 'csslint', 'jshint:all', 'concat:js', 'uglify']);
};
