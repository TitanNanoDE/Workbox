let gulp = require('gulp');
let glob = require('glob');
let config = require('./config');
let Stream = require('stream');
let file = require('gulp-file');
let path = require('path');

let name = 'buildModules';

gulp.task(name, [], () => {

    let stream = new Stream.Readable();
    let files = glob.sync(config.src + '/kernel/modules/*');
    let core = files.findIndex(item => item.search(/Core\.js$/) > 0);

    stream._read = function(){};
    files.splice(core, 1);

    let result = files.map((file, index) => {
        let relative = path.relative(config.src + '/kernel/modules/', file);

        return `export { default as m${index} } from './${relative}';`;
    }).join('\n');

    return file('index.js', result, { src: true })
        .pipe(gulp.dest(config.build + '/kernel/modules'));
});

module.exports = name;
