const md-it = require('markdown-it')({
  html:         true,        // Enable HTML tags in source
  xhtmlOut:     false,        // Use '/' to close single tags (<br />).
                              // This is only for full CommonMark compatibility.
  breaks:       true,        // Convert '\n' in paragraphs into <br>
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

exports.main = function(mdPath) {
  var pages = fs.readFileSync(mdPath);

  pages = spawnSync('sed', ['-e', 's/^    /\\&nbsp;\\&nbsp;\\&nbsp;\\&nbsp;/g'], {input: pages}).stdout.toString();
  pages = spawnSync('sed', ['-e', 's/^    /\\&nbsp;\\&nbsp;\\&nbsp;\\&nbsp;/g'], {input: pages}).stdout.toString();
  pages = spawnSync('sed', ['-e', 's/^  /\\&nbsp;\\&nbsp;/g'], {input: pages}).stdout.toString();
  pages = spawnSync('sed', ['-e', 's/^ /\\&nbsp;/g'], {input: pages}).stdout.toString();

  fs.writeFileSync('./hoge.json', JSON.stringify(md-it.parse(pages), null, '  ')); 

  pages = md-it.render(pages);
  pages = spawnSync('perl', ['-0pe', 's/\n<h1><\\/h1>\n<h1>/\n<\\/div>\n\n<div class="step" >\n<h1>/mg'], {input: pages}).stdout.toString();
  pages = spawnSync('perl', ['-0pe', 's/^<h1><\\/h1>\n<h1>/<div class="step" >\n<h1>/gm'], {input: pages}).stdout.toString();
  pages = spawnSync('perl', ['-0pe', 's/<\\/h2>(.*?)(<\\/div>|<h1>|<h2>|<h3>)/<\\/h2>\n<section class="level-2" >$1<\\/section>\n$2/gs'], {input: pages}).stdout.toString();
  pages = spawnSync('perl', ['-0pe', 's/<\\/h3>(.*?)(<\\/div>|<h1>|<h2>|<h3>|<h4>)/<\\/h3>\n<section class="level-3" >$1<\\/section>\n$2/gs'], {input: pages}).stdout.toString();
  // -p print 必須 デフォルトでは1行ずつ-eの引数を評価する。つまりセパレータが\n。
  // /g \nマッチ & -0セパレータがヌル文字(\0)ファイル全体を一度に読み込む
  // /s .が改行を含む

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

  fs.writeFile('./Notes/'+title+'.html', html, function(err) {
      if(err) { return console.log(err); }
  }); 

//  console.log("start decktape(html>pdf)");
//  exec('./decktape-1.0.0/phantomjs ./decktape-1.0.0/decktape.js impress ./Notes/'+title+'.html ./Notes/'+title+'.pdf', (err, stdout, stderr) => {
//    if (err) { console.log(err); }
//    console.log(stdout);
//  });

  exec('[ -e ./Notes/'+cssName+' ] || cp ./Notes/impress/template.css ./Notes/'+cssName, (err, stdout, stderr) => {
    if (err) { console.log(err); }
    console.log(stdout);
  });

//  exec('cp -f '+mdPath+' ./Notes/'+fileName, (err, stdout, stderr) => {
//    if (err) { console.log(err); }
//    console.log(stdout);
//  });

  return true;
}
