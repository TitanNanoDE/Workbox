const gulp 	 = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence'),
    Webpack = require('webpack'),
    path = require('path'),
    Gutil = require('gulp-util'),
    systemModulesBuilder = require('./Gulp/systemModulesBuilder'),
    buildStage = require('./Gulp/buildStage'),
    bundleTemplates = require('gulp-bundle-templates');
const webpackStream = require('webpack-stream');
const named = require('vinyl-named');
const rename = require('gulp-rename');
const filelist = require('gulp-filelist');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('copy:userspace', [],  () => {
    return gulp.src(['src/userSpace/**'])
        .pipe(gulp.dest('dist/userSpace'));
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

gulp.task('build:static-volume', ['copy:userspace'], () => {
    return gulp.src('dist/userSpace/**')
        .pipe(filelist('static-volume.json', { relative: true }))
        .pipe(gulp.dest('build/kernel/'));
});

gulp.task('webpack', [buildStage, systemModulesBuilder, 'build:static-volume'], (callback) => {
    // run webpack
    Webpack({
        entry: {
            io: path.join(__dirname, 'build', 'io', 'index.js'),
        },
        context : path.join(__dirname, 'build'),
        output : {
            pathinfo: true,
            path : path.join(__dirname, 'dist'),
            filename : '[name].js',
            sourceMapFilename: '[file].map',
        },
        module: {
            rules: [{
                test: /\.html$/,
                use: ['dom-loader', 'html-loader']
            }, {
                include: path.resolve(__dirname, 'build/threading'),
                sideEffects: false
            }],
        },

        externals: ['fs'],

        plugins : [
            new Webpack.IgnorePlugin(/vertx/),
        ],

        optimization: {
            concatenateModules: false,
            minimizer: [
                new UglifyJsPlugin({
                    sourceMap: true,
                    uglifyOptions: {
                        mangle: false,
                        compress: false,
                        output: {
                            beautify: true,
                        }
                    }
                })
            ]
        },

        devtool: 'source-map',
        mode: 'production',
    }, (err, stats) => {
        if(err) throw new Gutil.PluginError('webpack', err);
        Gutil.log('[webpack]', stats.toString());
        callback();
    });
});

gulp.task('build:threads', [buildStage, systemModulesBuilder, 'build:static-volume'], () => {
    return gulp.src(['build/kernel/index.js', 'build/process/index.js'])
        .pipe(named((file) => {
            const packageName = path.parse(file.path).dir.match(/[^/]*$/)[0];

            return packageName;
        }))
        .pipe(webpackStream({
            context : path.join(__dirname, 'build'),
            output: {
                filename: path.join('[name].js'),
                sourceMapFilename: '[file].map'
            },
            module: {
                rules: [{
                    include: path.resolve(__dirname, 'build/threading'),
                    sideEffects: false
                }],
            },
            optimization: {
                concatenateModules: false,
                minimizer: [
                    new UglifyJsPlugin({
                        sourceMap: true,
                        uglifyOptions: {
                            output: {
                                beautify: true,
                            },
                            mangle: false,
                            compress: false,
                        }
                    })
                ]
            },
            mode: 'production',
            target: 'webworker',
            devtool: 'source-map',
        }, require('webpack'))
            .on('error', (error) => {
                Gutil.log(error.message);
                process.exit(1);
            }))
        .pipe(gulp.dest('dist/'));
});

const getPackageName = function(file) {
    const packageName = path.parse(file.path).dir.match(/[^/]*$/)[0];

    return packageName;
};

const transformFileToPackage = function(path) {
    path.basename = path.dirname;
    path.dirname = '';

    return path;
};

gulp.task('build:packages', () => {
    return gulp.src('src/packages/*/index.js')
        .pipe(named(getPackageName))
        .pipe(webpackStream({
            output: {
                filename: path.join('[name].js'),
                libraryTarget: 'umd',
                library: '[name]',
            },

            externals: ['System']
        }))
        .pipe(gulp.dest('dist/packages/'));
});

gulp.task('build:packages:views', () => {
    return gulp.src('src/packages/*/views.js')
        .pipe(named(getPackageName))
        .pipe(webpackStream({
            output: {
                filename: path.join('[name].views.js'),
                libraryTarget: 'umd',
                library: '[name]',
            },

            module: {
                rules: [{
                    test: /\.html$/,
                    use: ['text-loader']
                }],
            },
        }))
        .pipe(gulp.dest('dist/packages/'));
});

gulp.task('copy:package-manifests', () => {
    return gulp.src('src/packages/**/manifest.json')
        .pipe(rename(transformFileToPackage))
        .pipe(gulp.dest('dist/packages/'));
});

gulp.task('watch', ['default'], () => {
    gulp.watch(['src/**/*.*'], ['copyToDist']);
});

gulp.task('default', (cb) => {
    runSequence('clean', ['copy', 'build:html', 'build:packages', 'copy:package-manifests', 'build:packages:views', 'build:threads', 'webpack'], cb);
});
