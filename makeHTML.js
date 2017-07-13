const ejs = require('ejs');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;
var marked = require('marked');

exports.main = function(mdPath) {
  var presn = new Object();
  presn.pages = fs.readFileSync(mdPath);
  presn.pages = spawnSync('sed', ['-e', 's/^    /\\&nbsp;\\&nbsp;\\&nbsp;\\&nbsp;/g'], {input: presn.pages}).stdout.toString();
  presn.pages = spawnSync('sed', ['-e', 's/^    /\\&nbsp;\\&nbsp;\\&nbsp;\\&nbsp;/g'], {input: presn.pages}).stdout.toString();
  presn.pages = spawnSync('sed', ['-e', 's/^  /\\&nbsp;\\&nbsp;/g'], {input: presn.pages}).stdout.toString();
  presn.pages = spawnSync('sed', ['-e', 's/^ /\\&nbsp;/g'], {input: presn.pages}).stdout.toString();
  presn.pages = marked(presn.pages);
  presn.pages = spawnSync('perl', ['-0pe', 's/\n<p>#</p>\n<h1>/\n<\\/div>\n\n<div class="step" >\n<h1>/mg'], {input: presn.pages}).stdout.toString();
  presn.pages = spawnSync('perl', ['-0pe', 's/^<p>#</p>\n<h1>/<div class="step" >\n<h1>/gm'], {input: presn.pages}).stdout.toString();
fs.writeFileSync('./impress-md/marked2.test', presn.pages); 
  presn.pages = spawnSync('perl', ['-0pe', 's/<\\/h2>(.*?)(<\\/div>|<h1>|<h2>|<h3>)/<\\/h2>\n<section class="level-2" >$1<\\/section>\n$2/gs'], {input: presn.pages}).stdout.toString();
  presn.pages = spawnSync('perl', ['-0pe', 's/<\\/h3>(.*?)(<\\/div>|<h1>|<h2>|<h3>|<h4>)/<\\/h3>\n<section class="level-3" >$1<\\/section>\n$2/gs'], {input: presn.pages}).stdout.toString();
  // -p print 必須 デフォルトでは1行ずつ-eの引数を評価する。つまりセパレータが\n。
  // /g \nマッチ & -0セパレータがヌル文字(\0)ファイル全体を一度に読み込む
  // /s .が改行を含む

  presn.html = fs.readFileSync('./ejs/index.html', 'utf8', function (err,data) {
    if (err) { return console.log(err); }
  });
  presn.fileName = path.basename(mdPath);
  presn.title = removeExtension(removeExtension(presn.fileName));
  presn.cssName = presn.title+'.css';
  presn.html = ejs.render(presn.html, {
    title: presn.title,
    css: presn.cssName,
    pages: presn.pages
  });

  console.log("made HTML : " + mdPath);
  return presn;
}

function removeExtension(fileName) {
  return fileName.split(/\.(?=[^.]+$)/)[0];
}
