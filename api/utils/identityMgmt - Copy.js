/*
//  Manage identity related stuff like
//         : loging check & getting contract if found when one is checking the log in.
*/
var mongoose = require('mongoose');

require('../models/FlatIdentityModel.js');
var IdDoc = mongoose.model('IdentityDoc');

require('../models/FlatContractModel.js');
var ContractDoc = mongoose.model('ContractDoc');

//Get the default connection
var db = mongoose.connection;

function checkLoginData(req) {

    //console.log("Inside check login ... " );
    var xx = 0;
    var ret = '';

    var queryStatement = "{ 'email' : " + req.query.email + ", 'pwd' :" + req.query.pwd + "}";

    console.log('query statement ... ' + queryStatement);
    //var query = ContractDoc.findOne({ 'email': email, 'contract_name': con_name, 'contract_version': version });
    var query = IdDoc.findOne({ 'email': req.query.email, 'pwd': req.query.pwd });

    query.select();
    query.exec(function (err, result) {
        if (err) {
            console.log("checkLoginData .. Error:" + err);
            ret = "Error:" + err;
        }
        console.log('result = ' + result);
        if (result) {
            console.log("Exists : " + result.email);
            ret = "Name:" + result.name;
            xx = 1;
        } else {
            xx = 1;
            console.log("New");
            ret = "Failed";
        }
    });

    var loop = 1;
    while (xx < 1) {
        require('deasync').sleep(1000);
        //console.log("Loop = " + loop + " xx = " + xx);
        loop++;
        if (loop > 25) {
            //console.log("Looping ifexists loop=" + loop + ' xx=' + xx + " >");
            ret = 'Timeout';
        }
    }

    return ret;

}

// Looks for contract in contract doc 
// if found, return to name, contact name, address and ABI
function getContract(req, name) {
    console.log("Inside getContract ... ");
    var xx = 0;
    var ret = '';
    // Add Copyright post MVP ... for there could be more than one contract and may not be of type Copyright.
    //var query = ContractDoc.findOne({ 'email': req.query.email, 'contract_type' : 'Copyright'  });
    var query = ContractDoc.findOne({ 'email': req.query.email });
    //console.log('query statement ... ' + queryStatement );
    query.select({ 'name': 1, 'abi': 1, 'contract_address': 1, 'txn_hash': 1, '_id': 0 });
    query.exec(function (err, result) {
        if (err) {
            console.log("getContract .. Error:" + err);
            ret = '{ "status" : "Error", "message" :' + err + '}';
        }
        console.log('result = ' + result);
        if (result) {
            console.log("Exists : " + result.contract_address);
            //ret = "{ 'status' : 'Success', 'name' : '" + name + "', 'result' : " + result + "}"; 
            ret = '{"status" : "Success", "name" : "' + name + '", "result" : ' + JSON.stringify(result) + '}';
            xx = 1;
        } else {
            xx = 1;
            console.log("New");
            ret = '{ "status" : "NoContract", "name" :' + name + ' "message" : "Needs to create a Copyright contract to proceed"}';
        }
    });

    var loop = 1;
    while (xx < 1) {
        require('deasync').sleep(1000);
        //console.log("Loop = " + loop + " xx = " + xx);
        loop++;
        if (loop > 25) {
            console.log("Looping getContract loop=" + loop + ' xx=' + xx + " >");
            ret = '{ "status" : "Error", "message" : "System error. Message reached timeout from database for contractDoc."  }';
            // ret = 'Timeout';
        }
    }

    return ret;
}

function addVisitor(req) {
    var newBaandaId = 10;
    var dberr = true;
    var retmsg = '';
    var doesexist = doesEmailExist(req);
    console.log("doesexist=" + doesexist.substring(0, 5));

    if (doesexist.substring(0, 5) == "Error") {
        return "System: Database error ... see server side log."
    } else if (doesexist.substring(0, 5) == "Exist") {
        return "Message: The email exists. Perhaps, you had registered before?";
    } else {
        //Make a collection for only BaandaId
        // Upsert and increment baanda id and use that as the new baanda ID.
        /*
        var query = IdDoc.findOne({}, null, {sort: {baanda_id : -1}}, callback); 
        query.exec(function(err, count) {
            if (err) {
                dberr = false;
                rtmsg = "Error : DB error ....";
                console.log("Error while trying to find max baanda_id");
            } else {
                newBaandaId = count + 1; 
                console.log("Next baanda_id = " + newBaandaId);
            }
        });
        */
        var xx = 0;
        if (dberr) {
            var newvisitor = new IdDoc(
                {
                    baanda_id: newBaandaId,
                    name: req.query.visitorname,
                    email: req.query.email,
                    pwd: req.query.pwd,
                    phone: 1111111111,
                    create_time: Date.now()
                }
            )
            newvisitor.save(function (error) {
                if (error) {
                    console.log("Error: Trying to save new visitor id data");
                    retmsg = "Error: Trying to save new visitor id data";
                    xx=1;
                } else {
                    console.log("Success: Saved your registration in the database.");
                    retmsg = "Success: You are a Baanda now.";
                    xx=1;
                }
            });

            var loop = 1;
            while (xx < 1) {
                require('deasync').sleep(100);
                //console.log("Loop = " + loop + " xx = " + xx);
                loop++;
                if (loop > 25) {
                    //console.log("Looping ifexists loop=" + loop + ' xx=' + xx + " >");
                    ret = 'Timeout';
                }
            }
        }
    }

    return retmsg;
}

function doesEmailExist(req) {
    console.log('Inside doesEmailExists ');
    var query = IdDoc.findOne({ 'email': req.query.email });
    var ret = '';
    var xx = 0;
    query.select();
    query.exec(function (err, result) {
        if (err) {
            console.log("doesEmailExist .. exec Error:" + err);
            ret = "Error:" + err;
            xx = 1;
        }
        if (result) {
            console.log("doesEmailExist - Yes : " + result.email);
            ret = "Exist";
            xx = 1;
        } else {
            console.log("Does not exist ... it is New");
            ret = "New_";
            xx = 1
        }
    });

    var loop = 1;
    while (xx < 1) {
        require('deasync').sleep(1000);
        //console.log("Loop = " + loop + " xx = " + xx);
        loop++;
        if (loop > 25) {
            //console.log("Looping ifexists loop=" + loop + ' xx=' + xx + " >");
            ret = 'Timeout';
        }
    }
    return ret;

}

module.exports.checkLoginData = checkLoginData;
module.exports.getContract = getContract;
module.exports.addVisitor = addVisitor;