const fs = require('fs');
const glob = require('glob');
const path = require('path');
const ejs = require('ejs');
const exec = require('child_process').exec;
const execSync = require("child_process").execSync;
const spawn = require('child_process').spawn;
const md = require('markdown-it')({
  html:         true,        // Enable HTML tags in source
  xhtmlOut:     false,        // Use '/' to close single tags (<br />).
                              // This is only for full CommonMark compatibility.
  breaks:       false,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'language-',  // CSS language prefix for fenced blocks. Can be
                              // useful for external highlighters.
  linkify:      false,        // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  typographer:  false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externaly.
  // If result starts with <pre... internal wrapper is skipped.
  highlight: function (/*str, lang*/) { return ''; }
});

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
  persistent:true //監視継続
  })
watcher.on('ready', function() { console.log("監視開始"); })
  .on('add', function(path) {
    console.log("追加ファイル-> " + path);
    if(convert(path)) { console.log("converted -> " + path); }
  })
  .on('change', function(path) {
    console.log("修正されました-> " + path);
    if(convert(path)) { console.log("converted -> " + path); }
  })
  .on('addDir', function(path) { console.log("追加ディレクトリ-> " + path); })
  .on('unlink', function(path) { console.log("削除されました-> " + path); })
  .on('unlinkDir', function(path) { console.log("削除されました-> " + path); })
  .on('error', function(error) { console.log("エラーです-> " + error); })

function convert(mdPath) {
  var pages = fs.readFileSync(mdPath);
  var cmd = fs.readFileSync("./beforeMd.sh")
  pages = execSync('echo "'+pages+'" '+cmd).toString();
  pages = md.render(pages);

  var perl = spawn('perl', ['-0pe', 's/^<h1><\/h1>\n<h1>/<\/div>\n\n<div class="step" >\n<h1>/mg']);
  //.stdin.write(pages);
  console.log('---------------------------------------------------');
  perl.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  perl.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  perl.on('close', (code) => {
    if (code !== 0) {
      console.log(`exited with code ${code}`);
    }
  });
  console.log('---------------------------------------------------');

  var html = fs.readFileSync('./ejs/index.html', 'utf8', function (err,data) {
    if (err) { return console.log(err); }
  });
  var fileName = path.basename(mdPath);
  var title = removeExtension(removeExtension(fileName));
  var cssName = title+'.css';
  html = ejs.render(html, {
    title: title,
    css: cssName,
    pages: pages
  });

  // exec('rm -f ./Notes/'+title+'.html', (err, stdout, stderr) => {
  //   if (err) { console.log(err); }
  //   console.log(stdout);
  // });
  fs.writeFile('./Notes/'+title+'.html', html, function(err) {
      if(err) { return console.log(err); }
  }); 

  //exec('./decktape-1.0.0/phantomjs ./decktape-1.0.0/decktape.js impress ./Notes/'+title+'.html ./Notes/'+title+'.pdf', (err, stdout, stderr) => {
  //  if (err) { console.log(err); }
  //  console.log(stdout);
  //});

  exec('[ -e ./Notes/'+cssName+' ] || cp ./Notes/impress/template.css ./Notes/'+cssName, (err, stdout, stderr) => {
    if (err) { console.log(err); }
    console.log(stdout);
  });

  exec('cp -f '+mdPath+' ./Notes/'+fileName, (err, stdout, stderr) => {
    if (err) { console.log(err); }
    console.log(stdout);
  });
}

function removeExtension(fileName) {
  return fileName.split(/\.(?=[^.]+$)/)[0];
}
