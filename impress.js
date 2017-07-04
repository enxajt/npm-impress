const fs = require('fs');
const glob = require('glob');
const path = require('path');
const ejs = require('ejs');
const exec = require('child_process').exec;
const execSync = require("child_process").execSync;
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;

const src_dir = "./Notes/";
const dst_dir = "./md/";
glob(src_dir+"/*.impress.md", function (er, files) {
  files.forEach(function (_path, index, array) {
    //var fn = _path.split(/\/(?=[^\/]+$)/)[1];
    var fileName = path.basename(_path);
    fs.createReadStream(_path).pipe(fs.createWriteStream(dst_dir + fileName));
    console.log(index + ' copyied : ' + _path + ' to ' + dst_dir + fileName);
  });
})

const chokidar = require('chokidar')
var watcher = chokidar.watch('./md', {
  ignored: /[\/\\]\./,
  persistent:true
  })
watcher.on('ready', function() { console.log("start watching"); })
  .on('add', function(path) {
    console.log("added file -> " + path);
    if(convert(path)) { console.log("converted -> " + path); }
  })
  .on('change', function(path) {
    console.log("modified file -> " + path);
    if(convert(path)) { console.log("converted -> " + path); }
  })
  .on('addDir', function(path) { console.log("added dir -> " + path); })
  .on('unlink', function(path) { console.log("deleted -> " + path); })
  .on('unlinkDir', function(path) { console.log("deleted -> " + path); })
  .on('error', function(error) { console.log("error -> " + error); })

function removeExtension(fileName) {
  return fileName.split(/\.(?=[^.]+$)/)[0];
}
