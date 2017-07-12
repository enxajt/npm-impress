const exec = require('child_process').exec;
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const chokidar = require('chokidar')
var watcher = chokidar.watch('./impress-md/*.impress.md', {
  ignored: /[\/\\]\./,
  persistent:true
})
watcher.on('ready', function() { console.log("start chokidar (file watching)"); })
  .on('add', function(mdPath) {
    console.log("chokidar is watching a file : " + mdPath);
    action(mdPath);
  })
  .on('change', function(mdPath) {
    console.log("chokidar found a modified file : " + mdPath);
    action(mdPath);
  })
  .on('addDir', function(mdPath) { console.log("added dir -> " + mdPath); })
  .on('unlink', function(mdPath) { console.log("deleted -> " + mdPath); })
  .on('unlinkDir', function(mdPath) { console.log("deleted -> " + mdPath); })
  .on('error', function(error) { console.log("error -> " + error); })

const makeHTML = require('./makeHTML.js');
function action(mdPath) {
  var presn  = makeHTML.main(mdPath);
  fs.writeFile('./impress-md/'+presn.title+'.html', presn.html, function(err) {
    if(err) { return console.log(err); }
  }); 
  exec('[ -e ./impress-md/impress ] || cp ./impress ./impress-md/impress', (err, stdout, stderr) => {
    if (err) { console.log(err); }
    console.log(stdout);
  });
  exec('[ -e ./impress-md/'+presn.cssName+' ] || cp ./impress-md/impress/template.css ./impress-md/'+presn.cssName, (err, stdout, stderr) => {
    if (err) { console.log(err); }
    console.log(stdout);
    console.log('made css');
  });
  console.log('made css');
  makePDF(presn);
  exec('cp -f ./impress-md/'+presn.cssName+' ./', (err, stdout, stderr) => {
    if (err) { console.log(err); }
    console.log(stdout);
  });
}

function makePDF(presn){
  console.log("start decktape(html>pdf)");
  exec('../decktape-1.0.0/phantomjs ../decktape-1.0.0/decktape.js impress ./impress-md/'+presn.title+'.html ./impress-md/'+presn.title+'.pdf', (err, stdout, stderr) => {
    if (err) { console.log(err); }
    console.log(stdout);
  });
}
