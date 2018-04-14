const gulp 	 = require('gulp'),
    del = require('del'),
    es = require('event-stream'),
    runSequence = require('run-sequence'),
    Webpack = require('webpack'),
    path = require('path'),
    Gutil = require('gulp-util'),
    systemModulesBuilder = require('./Gulp/systemModulesBuilder'),
    buildStage = require('./Gulp/buildStage'),
    bundleTemplates = require('gulp-bundle-templates');

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('copyToDist', ['webpack'],  () => {
    return es.merge(gulp.src(['src/**', '!src/**/*.js', '!src/**/*.html', '!src/**/node_modules/**'])
        .pipe(gulp.dest('dist')));
});

gulp.task('build:html', [], () => {
    return gulp.src('src/index.html')
        .pipe(bundleTemplates())
        .pipe(gulp.dest('dist/'));
});

gulp.task('webpack', [buildStage, systemModulesBuilder], (callback) => {
    // run webpack
    Webpack({
        entry : [path.join(__dirname, 'build', 'core', 'System.js')],
        context : path.join(__dirname, 'build'),
        output : {
            pathinfo: true,
            path : path.join(__dirname, 'dist'),
            filename : 'app.js'
        },
        module: {
            rules: [{
                use: [{
                    loader: 'babel-loader',
                    options : {
                        presets: ['es2015'],
                        sourceMaps: true,
                    },
                }],
                test: /\.js$/,
            }],
        },

        plugins : [
            new Webpack.IgnorePlugin(/vertx/)
        ],

        devtool : 'source-map',
    }, (err, stats) => {
        if(err) throw new Gutil.PluginError('webpack', err);
        Gutil.log('[webpack]', stats.toString());
        callback();
    });
});

gulp.task('watch', ['default'], () => {
    gulp.watch(['src/**/*.*'], ['copyToDist']);
});

gulp.task('default', (cb) => {
    runSequence('clean', ['copyToDist', 'build:html'], cb);
});
