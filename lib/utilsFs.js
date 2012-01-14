(function () {

    /**
     * Module dependencies.
     */
    var fs = require('fs'),
        path = require('path'),
        os = require('os'),
        defer = process.nextTick,
        utils = require('./utils.js');

    var SEP = os.platform().indexOf('win')>-1?'\\':'/';

    // ---------------------------------------------------------------------------------------------------------------
    //                              fs
    // ---------------------------------------------------------------------------------------------------------------

    /**
     * Return True if file ord directory exists.
     * @param fileordir {String} Full file name. i.e. 'c:/myfile.txt'
     */
    function exists(fileordir){
        try {
            var stats = fs.lstatSync(fileordir);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Return True if passed path is a file.
     * @param fileordir {String} Full file name. i.e. 'c:/myfile.txt'
     */
    function isFile(fileordir){
        try {
            var stats = fs.lstatSync(fileordir);
            return stats.isFile();
        } catch (e) {
            return false;
        }
    }

    /**
     * Return True if passed path is a directory.
     * @param fileordir {String} Full file name. i.e. 'c:/mydir/'
     */
    function isDirectory(fileordir){
        try {
            var stats = fs.lstatSync(fileordir);
            return stats.isDirectory();
        } catch (e) {
            return false;
        }
    }

    /**
     * Read a text file. Returns file content as String
     * or empty string if file does not exists.
     * @param filename {String} Full file name. i.e. 'c:/mydir/myfile.txt'
     */
    function readTextSync(filename){
        try{
            if(isFile(filename)){
                return fs.readFileSync(filename, 'utf8');
            }
        }catch(err){
            console.log(err);
        }
        return '';
    }

    /**
     * Asynchronously reads the entire contents of a file.
     * The callback is passed two arguments (err, data), where data is the contents of the file.
     * If no encoding is specified, then the raw buffer is returned.
     *
     * Example:
     *
     * fs.readFile('/etc/passwd', function (err, data) {
     *   if (err) throw err;
     *     console.log(data);
     *   });
     *
     * @param filename {string}
     * @param callback {function} The callback is passed two arguments (err, data), where data is the contents of the file.
     */
    function readTextAsync(filename, callback){
        fs.readFile(filename, 'utf8', callback);
    }

    /**
     * Read a text file and parse content as JSON. Returns JSON object from text
     * or empty JSON object if file does not exists.
     * @param filename {String} Full file name. i.e. 'c:/mydir/myfile.txt'
     */
    function readJSONSync(filename){
        try{
            var text = readTextSync(filename);
            return utils.hasText(text)?JSON.parse(text):{};
        }catch(err){
            console.log(err);
        }
        return {};
    }

    /**
     * Asynchronously writes data to a file, replacing the file if it already exists. data can be a
     * string or a buffer. The encoding argument is ignored if data is a buffer.
     *
     * Example:
     *
     *  fs.writeFile('message.txt', 'Hello Node', function (err) {
     *  if (err) throw err;
     *  console.log('It\'s saved!');
     *  });
     *
     * @param filename
     * @param data
     * @param callback {function} function(err)
     */
    function writeTextAsync(filename, data, callback){
        fs.writeFile(filename, data, 'utf8', callback);
    }

    function writeTextSync(filename, data){
        fs.writeFile(filename, data, 'utf8');
    }

    function mkdir(p, mode, callback){
        defer(function(){
            var error = null;
            try{
                mkdirSync(p, mode);
            }catch(err){
                error = err;
            }
            if(callback){
                callback(error);
            }
        });
    }

    /**
     * Synchronous.
     * Create directory recursively.
     * @param p
     * @param mode
     */
    function mkdirSync(p, mode){
        var tokens = pathTokenize(pathResolve(p));
        for(var i=0;i<tokens.length;i++){
            var path = (null!=path?path:'') + tokens[i].concat('/');
            if(!exists(path)){
                fs.mkdirSync(path, mode);
            }
        }
    }

    /**
     * Asynchronous readdir.
     * Reads the contents of a directory.
     * The callback gets two arguments (err, files) where files is an array
     * of the names of the files in the directory excluding '.' and '..'.
     * @param p
     * @param mode
     */
    function readdir(path, callback){
        fs.readdir(path, callback);
    }

    /**
     * Synchronous readdir.
     * Returns an array of filenames excluding '.' and '..'.
     * @param path
     */
    function readdirSync(path){
        return fs.readdirSync(path);
    }
    // ---------------------------------------------------------------------------------------------------------------
    //                              path
    // ---------------------------------------------------------------------------------------------------------------

    /**
     * Normalize a string path, taking care of '..' and '.' parts.
     * When multiple slashes are found, they're replaced by a single one;
     * when the path contains a trailing slash, it is preserved.
     * On windows backslashes are used.
     *
     * Example:
     *
     * pathNormalize('/foo/bar//baz/asdf/quux/..')
     *   // returns
     *   '/foo/bar/baz/asdf'
     */
    function pathNormalize(spath){
        return path.normalize(spath);
    }

    /**
     * Join all arguments together and normalize the resulting path. Non-string arguments are ignored.
     *
     * Example:
     *
     * pathJoin('/foo', 'bar', 'baz/asdf', 'quux', '..')
     *  // returns
     *  '/foo/bar/baz/asdf'
     *
     * pathJoin('foo', {}, 'bar')
     *  // returns
     *  'foo/bar'
     */
    function pathJoin(){
        var result,
            args = Array.prototype.slice.call(arguments);
        for(var i=0;i<args.length;i++){
            result = path.join(result, args[i]);
        }
        return result;
    }

    /**
     * Resolves to to an absolute path.
     * If to isn't already absolute from arguments are prepended in right to left order,
     * until an absolute path is found.
     * If after using all from paths still no absolute path is found, the current working directory is used as well.
     * The resulting path is normalized, and trailing slashes are removed unless the path gets resolved to
     * the root directory.
     * Non-string arguments are ignored.
     *
     * Another way to think of it is as a sequence of cd commands in a shell.
     *  path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile')
     * Is similar to:
     *  cd foo/bar
     *  cd /tmp/file/
     *  cd ..
     *  cd a/../subfile
     *  pwd
     */
    function pathResolve(){
        var result,
            args = Array.prototype.slice.call(arguments);
        for(var i=0;i<args.length;i++){
            result = path.resolve(result, args[i]);
        }
        return result;
    }

    /**
     * Solve the relative path from 'from' to 'to'.
     * At times we have two absolute paths, and we need to derive the relative path from one to the other.
     * This is actually the reverse transform of path.resolve, which means we see that:
     *  path.resolve(from, path.relative(from, to)) == path.resolve(to)
     *
     * Examples:
     *
     *  path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb')
     *  // returns
     *  '..\\..\\impl\\bbb'
     *
     *  path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')
     *  // returns
     *  '../../impl/bbb'
     *
     * @param from
     * @param to
     */
    function pathRelative(from, to){
        return path.relative(from, to);
    }

    /**
     * Return the directory name of a path. Similar to the Unix dirname command.
     *
     * Example:
     *
     *  path.dirname('/foo/bar/baz/asdf/quux')
     *  // returns
     *  '/foo/bar/baz/asdf'
     *
     * @param p
     */
    function pathDirName(p){
        return path.dirname(p);
    }

    /**
     * Return the last portion of a path. Similar to the Unix basename command.
     *
     * Example:
     *
     *  path.basename('/foo/bar/baz/asdf/quux.html')
     *  // returns
     *  'quux.html'
     *
     *  path.basename('/foo/bar/baz/asdf/quux.html', '.html')
     *  // returns
     *  'quux'
     * @param p
     * @param ext
     */
    function pathBaseName(p, ext){
        return path.basename(p, ext);
    }

    /**
     * Return the extension of the path, from the last '.' to end of string in the last portion of the path.
     * If there is no '.' in the last portion of the path or the first character of it is '.',
     * then it returns an empty string.
     *
     * Examples:
     *
     *  path.extname('index.html')
     *  // returns
     *  '.html'
     *
     *  path.extname('index.')
     *  // returns
     *  '.'
     *
     *  path.extname('index')
     *  // returns
     *  ''
     * @param p
     */
    function pathExtName(p){
        return path.extname(p);
    }

    /**
     * Async method.
     * Test whether or not the given path exists by checking with the file system.
     * Then call the callback argument with either true or false.
     *
     * Example:
     *
     *  path.exists('/etc/passwd', function (exists) {
     *    util.debug(exists ? "it's there" : "no passwd!");
     *  });
     *
     * @param p
     * @param callback
     */
    function pathExists (p, callback){
        path.exists(p, callback);
    }

    // ---------------------------------------------------------------------------------------------------------------
    //                              paths
    // ---------------------------------------------------------------------------------------------------------------

    /**
     * Return an Array of path tokens.
     * @param path {string} Path. i.e. '/data/file.txt'
     */
    function pathTokenize(path) {
        var result = new Array(),
            psep = path.indexOf('/')>-1?'/':'\\';
        if(path){
            var tmp = path.split(psep);
            for(var i=0;i<tmp.length;i++){
                var token = tmp[i].trim();
                if(token.length>0){
                    result.push(token);
                }
            }
        }
        return result;
    }

    // ---------------------------------------------------------------------------------------------------------------
    //                              exports
    // ---------------------------------------------------------------------------------------------------------------

    //-- fs --//
    exports.exists = exists;
    exports.isFile = isFile;
    exports.isDirectory = isDirectory;
    exports.readTextSync = readTextSync;
    exports.readTextAsync = readTextAsync;
    exports.readJSONSync = readJSONSync;
    exports.writeTextAsync = writeTextAsync;
    exports.writeTextSync = writeTextSync;
    exports.mkdir = mkdir;
    exports.mkdirSync = mkdirSync;
    exports.readdir = readdir;
    exports.readdirSync = readdirSync;

    //-- path --//
    exports.pathNormalize = pathNormalize;
    exports.pathJoin = pathJoin;
    exports.pathResolve = pathResolve;
    exports.pathRelative = pathRelative;
    exports.pathDirName = pathDirName;
    exports.pathBaseName = pathBaseName;
    exports.pathExtName = pathExtName;
    exports.pathExists = pathExists;

    //-- paths --//
    exports.pathTokenize = pathTokenize;

})();