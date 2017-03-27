process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

var stdin = process.openStdin();
var data = "";
stdin.on('data', function(chunk) {
  data += chunk;
});
stdin.on('end', function() {
  console.log("DATA:\n" + data + "\nEND DATA");
});
