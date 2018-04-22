const util = require('../utils/utility.js');
const cnd = require('../utils/compileDeploySol.js');
const db = require('../utils/contractDB.js');
const idMgmt = require('../utils/identityMgmt.js');
const crMgmt = require('../utils/copyrightMgmt.js');
//const nreg = require('../utils/registrationMgmt.js');

var templateFile = '', targetFile = '', toReplace = '', targetConName = '';

exports.gen_copyright_contract = function (req, res) {

    //console.log(JSON.stringify(req.query));
    //console.log("Via Bodyparser contract_name:" + req.query.contract_name);
    var email = req.query.emailAddress;
    var con_name = 'CR_' + req.query.contract_name;
    var version = 1;

    var outcome = '';
    var doesContractExists = db.ifContractExists(email, con_name, version);
    if (doesContractExists == "Exists") {
        outcome = "Exists: You already have a contract with the name above.";
    } else if (doesContractExists == "New") {
        nltoflcopyright(req.query.contract_name);
        // The following creates the solidity smart contract file and string.
        var scdata = util.replaceStrInFile(templateFile, targetFile, toReplace, targetConName);
        console.log('1. Smart Contract data = ' + scdata.substring(0, 20));
        // Pass request input string and solidity contract file read data.
        outcome = cnd.compNdeploy(req, scdata, targetConName);
    } else {
        outcome = doesContractExists;  
    }
    console.log("Return Message : " + outcome);

    res.send(outcome);

}

function nltoflcopyright(contract_name) {
    // templateFile = '../baandaserver/api/template/CopyrightTemplate.sol';
    templateFile = '../baandaserver/api/template/Copyright.sol';
    //templateFile = '../baandaserver/api/template/Testing.sol';
    // Adding a CR_ to highlight Copyright contract ... and all contracts would start with CR_
    targetFile = '../baandaserver/api/target/' + 'CR_' + contract_name + '.sol';
    //toReplace    = /#XXX#/g; 
    //toReplace    = /CopyrightTemplate/g;
    toReplace = /Copyright/g;
    //toReplace = /Testing/g;

    targetConName = 'CR_' + contract_name;
    console.log('template file=' + templateFile + ' | target file=' + targetFile + ' | toReplace=' + toReplace + ' |targetConName=' + targetConName);
}

// 
exports.check_login = function (req, res) {
    console.log('"Inside check_login ......');
    var ret = idMgmt.checkLoginData(req);
    var retmsg = '';
    if (ret.substring(0,4) == "Erro") {
        retmsg = '{ "status" : "Error", "message" : ' + retmsg + ' }';
    } else if ( ret.substring(0,4) == "Fail" ) {
        retmsg = '{ "status" : "LoginFailed", "message" : "No such email and password in Baanda."  }';
    } else if ( ret.substring(0,4) == "Time" ) {
        retmsg = '{ "status" : "Error", "message" : "System error. Message reached timeout from database for Identity."  }';
    } else  {
        // Extract user's name and send it to getContract ... to create the final output.
        var username = ret.substring(5, ret.length);
        console.log("Entering for getContract ....");
        // intermediate variable for debugging. Should be streamlined later on. 
        var retract = idMgmt.getContract(req, username);
        retmsg = retract;
        /*
        if ( retract.substring(0,4) == "Time" ){
            retmsg = "{ 'status' : 'Error', 'message' : 'System error. Message reached timeout from database for contractDoc.'  }";
        } else {
            retmsg = retract;
        }
        */
    }
    
    //res.send('Log Testing: email=' + req.query.email + " pwd=" + req.query.pwd + " ret=" + ret);
    console.log('1. retmsg = ' + retmsg);
    //console.log("2. retract : " + retract);
    res.send(retmsg);
}


// This forwards the copyright management or handling to cpyrightMgmt utility and returns the respons to the caller
function addCopyright(req, res) {
    // work with crMgmt
    //console.log ("@debug:addCopyright::"+ JSON.stringify(req.body));
    console.log ("file path:"+ req.files.cpfile.name );
    //console.log ("file path:"+ req.files.cpfile.name + ":" + req.files.cpfile.mimetype + ":" + req.files.cpfile.data );
    console.log ("@debug:addCopyright headers is::"+ JSON.stringify(req.headers));
    console.log ("@debug:addCopyright req is::"+ JSON.stringify(req.body));
    console.log ("-----------------------------------------------------");  
    console.log ("@debug:addcopyright body is : " + req.files.cpfile.data );

    var response = crMgmt.copyrightMgmt(req);
    //var response = crMgmt.testMethodCall(req);
    //var response = crMgmt.testing(req);

    res.send(response);
}

function newRegistration(req, res){
    var response = idMgmt.addVisitor(req);
    console.log('Response new Registration : ' + response);
    res.send(response);
}

module.exports.addCopyright = addCopyright;
module.exports.newRegistration = newRegistration;