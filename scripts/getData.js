var extractSheets = require('spreadsheet-to-json').extractSheets;

var fs = require('fs');

var apiKey;
try {
  apiKey = fs.readFileSync('local-api-key.txt', 'utf-8').trimRight('\n');
} catch (e) {
  var url = 'https://github.com/revolunet/spreadsheet-to-json';
  console.error('You need an API key to run this. Please see ' + url +
      ' and store this in local-api-key.txt in the project root');
  process.exit(1);
}

extractSheets({
  spreadsheetKey: '1h6dVJKtETWX3Kr9PT6EaLu0gGavdi8Gnj4IlX155pfY',
  credentials: apiKey,
  sheetsToExtract: ['Sheet1'],
},
function (err, result) {
  if (err) {
    console.error('Something went wrong');
    console.log(err.message);
    console.log(err.stack);
    process.exit(1);
  }

  // We only need the data from Sheet1.
  result = result.Sheet1;
  result = result.map(function (bro) {
    if (bro.familyStarted) {
      bro.familystarted = bro.familyStarted;
      delete bro.familyStarted;
    }
    // Un-stringify booleans.
    Object.keys(bro).forEach(function (key) {
      if (bro[key] === 'TRUE') {
        bro[key] = true;
      }
    });
    // Remove empty fields as a storage and readability optimization.
    Object.keys(bro).forEach(function (key) {
      if (bro[key] === null || bro[key] === undefined) {
        delete bro[key];
      }
    });
    return bro;
  });

  var str = 'var brothers = ' + JSON.stringify(result, undefined, 2) + ';\n';
  fs.writeFileSync('relations.js', str);
})
  .catch(function (err) {
    console.error('Something went wrong');
    console.log(err.message);
    console.log(err.stack);
    process.exit(1);
  });

