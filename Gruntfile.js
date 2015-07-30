/*!
 * Elise Library's gruntfile
 **/

module.exports = exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n\n',
                banner: '/*! <%=pkg.name%>'
                       +'\n * @version <%=pkg.version%>'
                       +'\n * @release <%= grunt.template.today("yyyy-mm-dd") %>'
                       +'\n * @url <%=pkg.repository.url%>'
                       +'\n */\n\n'
            },
            javascript: {
                src: [
                    'js/elise.core.js',
                    'js/elise.tip.js',
                    'js/elise.alert.js',
                    'js/elise.modal.js',
                    'js/elise.loader.js',
                    'js/elise.hope.js'
                ],
                dest: 'dist/elise.js',
            },
            css: {
                src: [
                    'css/elise.core.css',
                    'css/elise.tip.css',
                    'css/elise.alert.css',
                    'css/elise.modal.css',
                    'css/elise.loader.css',
                    'css/elise.hope.css'
                ],
                dest: 'dist/elise.css',
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            javascript: {
                src: 'dist/elise.js',
                dest: 'dist/elise.min.js'
            }
        },

        cssmin: {
            css: {
                src: 'dist/elise.css',
                dest: 'dist/elise.min.css'
            }
        }
    });

    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};
