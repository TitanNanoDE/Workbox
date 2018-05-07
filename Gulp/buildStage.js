var gulp = require('gulp');
var config = require('./config');

var name ='coppy::buildStage';

gulp.task(name, () => {
    return gulp.src([config.src + '/**/*', `!${config.src}/af/node_modules/**/*`])
        .pipe(gulp.dest(config.build));
});

module.exports = name;
