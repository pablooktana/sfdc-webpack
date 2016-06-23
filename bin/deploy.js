var exports = module.exports = {};
var fs = require('fs');
var path = require('path');
var jsforce = require('jsforce');
var conn = new jsforce.Connection({loginUrl : 'https://login.salesforce.com'});

var settings = require('../settings');

var createMetadataPkg = function (res) {
  //1 - run webpack build
  //2 - create zip file with dist files
  //3 - upload to StaticResource

	var bitmap = fs.readFileSync(path.join(__dirname,'./' + settings.package.name + '.zip'));
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

conn.login(settings.credentials.user, user.credentials.password)
    .then(createMetadataPkg)
    .then(upsertMetadata)
    .then(function(res){console.log(res);})
    .catch(function(res){console.log(res);});
