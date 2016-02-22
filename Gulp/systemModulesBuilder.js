var gulp = require('gulp');
var glob = require('glob');
var config = require('./config');
var Stream = require('stream');
var file = require('gulp-file');
var path = require('path');

var name = 'buildModules';

gulp.task(name, [], function(){

    var stream = new Stream.Readable();
    var files = glob.sync(config.src + '/core/System/modules/*.js');
    var core = files.findIndex(item => item.search(/Core.js$/) > 0);

    stream._read = function(){};
    files.splice(core, 1);

    var result = files.reduce((prev, file, index) => {
        file = file.replace(config.src, config.build);
        var relative = path.relative(config.build + '/core/System/', file);

        return `${prev}import m${index} from './${relative}';\n`;
    }, '');

    result += 'export default [' + files.map((_, index) => 'm' + index) + '];\n';

    return file('modules.js', result, { src: true })
        .pipe(gulp.dest(config.build + '/core/System'));
});

module.exports = name;
