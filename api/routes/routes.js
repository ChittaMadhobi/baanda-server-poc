// This should provide a clear list of API called from outside world
'use strict';
var docList = require('../controller/controller');

module.exports = function (app) {
   // var docList = require('../controller/controller');
  
    app.route('/genCRCApi')
    .get(docList.gen_copyright_contract);

    app.route('/checklogin')
    .get(docList.check_login);

    app.route('/addCopyrightAPI')
    .post(docList.addCopyright);

    app.route('/registrationAPI')
    .get(docList.newRegistration);

};

