const gulp 	 = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence'),
    Webpack = require('webpack'),
    path = require('path'),
    Gutil = require('gulp-util'),
    systemModulesBuilder = require('./Gulp/systemModulesBuilder'),
    buildStage = require('./Gulp/buildStage'),
    bundleTemplates = require('gulp-bundle-templates');
const rename = require('gulp-rename');
const webpackStream = require('webpack-stream');
const named = require('vinyl-named');

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('copy:userspace', [],  () => {
    return gulp.src(['src/userSpace/**'])
        .pipe(gulp.dest('dist/userSpace'));
});

gulp.task('copy:packages', [], () => {
    return gulp.src(['src/packages/**/dist/package.js'])
        .pipe(rename((path) => {
            const packageName = path.dirname.match(/[^/]*/)[0];

            path.dirname = '';
            path.basename = packageName;
        }))
        .pipe(gulp.dest('dist/packages'));
});

gulp.task('copy:styles', [], () => {
    return gulp.src('src/core/styles/**')
        .pipe(gulp.dest('dist/styles'));
});

gulp.task('copy:fonts', [], () => {
    return gulp.src('src/core/fonts/**')
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('copy', ['copy:userspace', 'copy:styles', 'copy:fonts']);

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
                test: /\.html$/,
                use: ['dom-loader', 'html-loader']
            }],
        },

        externals: ['fs'],

        plugins : [
            new Webpack.IgnorePlugin(/vertx/),
        ],

        devtool : 'source-map',
    }, (err, stats) => {
        if(err) throw new Gutil.PluginError('webpack', err);
        Gutil.log('[webpack]', stats.toString());
        callback();
    });
});

gulp.task('build:packages', () => {
    return gulp.src('src/packages/**/index.js')
        .pipe(named((file) => {
            const packageName = path.parse(file.path).dir.match(/[^/]*$/)[0];

            return packageName;
        }))
        .pipe(webpackStream({
            output: {
                filename: path.join('[name].js'),
                libraryTarget: 'umd',
                library: '[name]',
            },

            module: {
                rules: [{
                    test: /\.html$/,
                    use: ['html-loader']
                }],
            },

            externals: ['System']
        }))
        .pipe(gulp.dest('dist/packages/'));
});

gulp.task('watch', ['default'], () => {
    gulp.watch(['src/**/*.*'], ['copyToDist']);
});

gulp.task('default', (cb) => {
    runSequence('clean', ['copy', 'build:html', 'build:packages', 'webpack'], cb);
});
