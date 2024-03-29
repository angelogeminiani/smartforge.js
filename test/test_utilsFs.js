var assert = require('assert'),
    utilsFs = require('../lib/utilsFs.js'),
    path = require('path'),
    os = require('os');

console.log(os.platform());

// ---------------------------------------------------------------------------------------------------------------
//                              pathResolve
// ---------------------------------------------------------------------------------------------------------------

var val1 = path.resolve ('/foo/bar', './baz');
var val2 = utilsFs.pathResolve ('/foo/bar', './baz');
assert.ok(val1===val2);

val1 = path.resolve ('/foo/bar', '/tmp/file/');
val2 = utilsFs.pathResolve ('/foo/bar', '/tmp/file/');
assert.ok(val1===val2);

val1 = path.resolve ('wwwroot', 'static_files/png/', '../gif/image.gif');
val2 = utilsFs.pathResolve ('wwwroot', 'static_files/png/', '../gif/image.gif');
assert.ok(val1===val2);

val1 = path.resolve ('/data');
val2 = utilsFs.pathResolve ('/data');
assert.ok(val1===val2);
console.log(val2);

val1 = path.resolve (__dirname, './data');
val2 = utilsFs.pathResolve (__dirname, './data');
assert.ok(val1===val2);
console.log(val2);

// ---------------------------------------------------------------------------------------------------------------
//                              pathBaseName
// ---------------------------------------------------------------------------------------------------------------
val1 = path.basename ('/foo/bar/baz/asdf/quux.html');
val2 = utilsFs.pathBaseName ('/foo/bar/baz/asdf/quux.html');
assert.ok(val1===val2);
console.log(val2);
val1 = path.basename ('/foo/bar/baz/asdf/quux.html', '.html');
val2 = utilsFs.pathBaseName ('/foo/bar/baz/asdf/quux.html', '.html');
assert.ok(val1===val2);
console.log(val2);

// ---------------------------------------------------------------------------------------------------------------
//                              mkdir
// ---------------------------------------------------------------------------------------------------------------

utilsFs.mkdir('/data/mktest/dir1/dir2', function (error){
    assert.ok(null===error);
});
