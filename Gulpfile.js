var gulp 	 = require('gulp'),
	del = require('del'),
	es = require('event-stream'),
	runSequence = require('run-sequence'),
    Webpack = require('webpack'),
    path = require('path'),
    Gutil = require('gulp-util'),
    systemModulesBuilder = require('./Gulp/systemModulesBuilder'),
    buildStage = require('./Gulp/buildStage');

gulp.task('clean', function() {
	return del(['dist']);
});

gulp.task('copyToDist', ['webpack'],  function(){
	return es.merge(gulp.src(['src/**', '!src/**/*.js'])
						.pipe(gulp.dest('dist'))
				    );
});

gulp.task("webpack", [buildStage, systemModulesBuilder], function(callback) {
    // run webpack
    Webpack({
        entry : [path.join(__dirname, 'build', 'core', 'System.js')],
        context : path.join(__dirname, 'build', ''),
        output : {
            path : path.join(__dirname, 'dist'),
            filename : 'app.js'
        },
        module: {
            loaders: [{
                loader: "babel-loader",
                test: /\.js$/,
                query : {
                    presets: ['es2015']
                },
                include: [
                    path.join(__dirname, 'build'),
                ]
            }],
        },

        plugins : [
            new Webpack.DefinePlugin({
                'process.platform' : '"browser"'
            })
        ],

        devtool : '#source-map',
    }, function(err, stats) {
        if(err) throw new Gutil.PluginError("webpack", err);
        Gutil.log("[webpack]", stats.toString());
        callback();
    });
});

gulp.task('watch', ['default'], function(){
	gulp.watch(['src/**/*.*'], ['copyToDist']);
})

gulp.task('default', function(cb){
	runSequence('clean', ['copyToDist'], cb);
});
