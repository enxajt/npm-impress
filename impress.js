const fs = require('fs');
const glob = require('glob');
const path = require('path');
const ejs = require('ejs');
const exec = require('child_process').exec;
const execSync = require("child_process").execSync;
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;

//const src_dir = "./Notes/";
//const dst_dir = "./md/";
//glob(src_dir+"/*.impress.md", function (er, files) {
//  files.forEach(function (_path, index, array) {
//    //var fn = _path.split(/\/(?=[^\/]+$)/)[1];
//    var fileName = path.basename(_path);
//    fs.createReadStream(_path).pipe(fs.createWriteStream(dst_dir + fileName));
//    console.log(index + ' copyied : ' + _path + ' to ' + dst_dir + fileName);
//  });
//})

const chokidar = require('chokidar')
const convert = require('./convert.js');
var watcher = chokidar.watch('**/*./md', {
  ignored: /[\/\\]\./,
  persistent:true
})
watcher.on('ready', function() { console.log("start chokidar (file watching)"); })
  .on('add', function(mdPath) {
    console.log("chokidar is watching a file : " + mdPath);
    if(convert.main(mdPath)) { console.log("converted : " + mdPath); }
  })
  .on('change', function(mdPath) {
    console.log("chokidar found a modified file : " + mdPath);
    if(convert.main(mdPath)) { console.log("converted : " + mdPath); }
  })
  .on('addDir', function(mdPath) { console.log("added dir -> " + mdPath); })
  .on('unlink', function(mdPath) { console.log("deleted -> " + mdPath); })
  .on('unlinkDir', function(mdPath) { console.log("deleted -> " + mdPath); })
  .on('error', function(error) { console.log("error -> " + error); })

function removeExtension(fileName) {
  return fileName.split(/\.(?=[^.]+$)/)[0];
}
