var gsjson = require('google-spreadsheet-to-json');
var fs = require('fs');

gsjson({
  spreadsheetId: '1h6dVJKtETWX3Kr9PT6EaLu0gGavdi8Gnj4IlX155pfY',
})
.then(function(result) {
  var str = 'var brothers = ' + JSON.stringify(result, undefined, 2) + ';\n';
  fs.writeFileSync('relations.js', str);
})
.catch(function(err) {
  console.error('Something went wrong');
  console.log(err.message);
  console.log(err.stack);
  process.exit(1);
});

