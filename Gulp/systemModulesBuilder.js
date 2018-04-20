let gulp = require('gulp');
let glob = require('glob');
let config = require('./config');
let Stream = require('stream');
let file = require('gulp-file');
let path = require('path');

let name = 'buildModules';

gulp.task(name, [], () => {

    let stream = new Stream.Readable();
    let files = glob.sync(config.src + '/core/System/modules/*');
    let core = files.findIndex(item => item.search(/Core.js$/) > 0);

    stream._read = function(){};
    files.splice(core, 1);

    let result = files.reduce((prev, file, index) => {
        file = file.replace(config.src, config.build);
        let relative = path.relative(config.build + '/core/System/', file);

        return `${prev}import m${index} from './${relative}';\n`;
    }, '');

    result += 'export default [' + files.map((_, index) => 'm' + index) + '];\n';

    return file('modules.js', result, { src: true })
        .pipe(gulp.dest(config.build + '/core/System'));
});

module.exports = name;
