module.exports = function(grunt){
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
      php: {
        devserver: {
          options: {
            port: '5000',
            base: 'src/',
          }
        }
      },
      open: {
        devserver: {
          path: "http://localhost:5000"
        },
        siesta: {
          path: 'http://localhost:5000/siesta'
        }
      },
      watch: {
        options: {
          livereload: true
        },
        bower: {
          files: ['bower.json'],
          tasks: ['bowerInstall']
        },
        scripts: {
          files: ['src/**/*.js'],
        },
        html: {
          files: ['src/**/*.html']
        },
        sass: {
          files: 'src/sass/**/*.scss',
          tasks: ['compass', 'autoprefixer']
        }
      },
      copy: {
        html: {
          src: 'src/index.html',
          dest: 'build/index.html'
        },
        css: {
          src: 'src/css/all.css',
          dest: 'build/all.css'
        }
      },
      cssmin: {
        css: {
          files: {
            'src/css/all.css': ['build/all.css']
          }
        }
      },
      uglify: {
        js: {
          files: {
            'build/app.js': 'build/app.js'
          }
        }
      },
      concat: {
        js: {
          src: [ 'src/locale/en.js', 'src/app/**/*.js', 'src/app.js'],
          dest: 'build/app.js'
        }
      },
      usemin: {
        html: 'build/index.html'
      },
      clean: {
        dist: 'build'
      },
      autoprefixer: {
        css: {
          src: 'src/css/all.css',
          dest: 'src/css/all.css'
        }
      },
      compass: {
        sass: {
          options: {
            sassDir: 'src/sass',
            cssDir: 'src/css'
          }
        }
      },
      // Automatically inject Bower components into the app
      bowerInstall: {
        app: {
          src: ['src/index.html']
        }
      }
  });

  grunt.registerTask('server', [
    'bowerInstall',
    'compass',
    'autoprefixer',
    'php:devserver',
    'open:devserver',
    'watch'
  ]);
  grunt.registerTask('build', [
    'clean',
    'bowerInstall',
    'compass',
    'autoprefixer',
    'copy',
    'concat',
    'uglify',
    'cssmin',
    'usemin'
  ]);
};