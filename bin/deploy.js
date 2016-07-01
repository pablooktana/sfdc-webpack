var exports = module.exports = {};
var fs = require('fs');
var path = require('path');
var jsforce = require('jsforce');
var archiver = require('archiver');
var webpack = require('webpack');
var conn = new jsforce.Connection({loginUrl : 'https://login.salesforce.com'});

var settings = require('../settings');
var tmp = '.tmp';

var createMetadataPkg = function (res) {
  //1 - run webpack build
  //2 - create zip file with dist files - done
  //3 - upload to StaticResource
  if (!fs.existsSync(tmp)){
    fs.mkdirSync(tmp);
  }

  webpack(require('../webpack.config'), function(err, stats){
    console.log(err);
  });

  var filename = tmp + '/' + settings.package.name + '.zip'
  var output = fs.createWriteStream(filename);
  var archive = archiver('zip');

  output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function(err){
      throw err;
  });

  archive.pipe(output);
  archive.bulk([
      { expand: true, cwd: path.resolve('app'), src: ['**'] }
  ]);
  archive.finalize();
  
	var bitmap = fs.readFileSync(filename);
  // convert binary data to base64 encoded string
  var base64Buf = new Buffer(bitmap).toString('base64');
  var metadata = [{
    fullName: settings.package.name,
    content: base64Buf,
    contentType: 'application/javascript',
    description: settings.package.description,
    cacheControl: settings.package.cacheControl
  }];

  return metadata;
};

var upsertMetadata = function(mdPkg) {
  return conn.metadata.upsert('StaticResource', mdPkg);
};

conn.login(settings.credentials.username, settings.credentials.password)
    .then(createMetadataPkg)
    .then(upsertMetadata)
    .then(function(res){console.log(res);})
    .catch(function(res){console.log(res);});
