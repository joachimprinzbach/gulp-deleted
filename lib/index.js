var Path = require("path");
var glob = require("glob-all");
var through2 = require("through2");
var del = require("del");

function getDeletedFiles(newFiles, dest, destPatterns) {
  return glob.sync(destPatterns, { cwd: Path.join(process.cwd(), dest) })
    .filter(function(item) { return newFiles.indexOf(item) === -1 })
    .map(function(item) { return Path.join(process.cwd(), dest,  item) });
}

module.exports = function(dest, destPatterns, options) {
  if (destPatterns === undefined) {
    return through2(function write(data) {
      this.emit('data', data);
    }, function end () {
      this.emit('end');
    });
  }

  var srcFiles = [];

  function transform(file, enc, cb) {
    if (file.relative) {
      srcFiles.push(file.relative);
    }
    this.push(file);
    cb();
  };

  function flush(cb) {
    del(getDeletedFiles(srcFiles, dest, destPatterns), options).then(function() {
      cb();
    });
  };

  return through2.obj(transform, flush);
};