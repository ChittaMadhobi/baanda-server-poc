/*
//  Insert and update smart contract information in mondgDB
*/
var mongoose = require('mongoose');

//var Docs = require('../models/FlatContractModel.js'); //created model loading here
//FlatContractModel

//var Docs = 

require('../models/FlatContractModel.js');
var ContractDoc = mongoose.model('ContractDoc');
//Get the default connection
var db = mongoose.connection;

/*
//var mongourl = "mongodb://localhost/testDB";
var mongoDB = "mongodb://localhost/BaandaDB";
//mongoose.connect(mongourl, { useMongoClient: true });
mongoose.connect(mongoDB, { useMongoClient: true });
//Get the default connection
var db = mongoose.connection;
var xx = 0;
db.on('connected', function () {
    console.log('xxxxxxxxxxxxxxxxx');
    xx = 1;
});

var loop = 1;
while (xx < 1) {
    require('deasync').sleep(1000);
    console.log("Loop = " + loop + " xx = " + xx);
    loop++;
    if (loop > 25) {
        console.log("Looping loop=" + loop + ' xx=' + xx + " >");
        return false;
    }
}


//var ContractDoc = mongoose.model('ContractDoc');

mongoose.Promise = global.Promise;

email = "a@b.com";
baandaID = 1;
con_name = "CR_GGGG";
con_type = "Copyright";
ver = 1;
abi = JSON.parse(JSON.stringify({ 'name': 'some name', 'parm1': 'haha' }));
txnhash = "0x35930d3a7718ee3b670a5595a7d959fa056b00bc5262ec17cb16467cb02a31d6";
conaddr = "0x9d7bf469540087f4a34ffaad053bd3de7dd36e77";
*/
//console.log('Before entering handleContractDB .... ');

//function saveContractInDB(email, baandaID, con_name, con_type, ver, abi, txnhash, conaddr); //{

//    var zz = ifemailexists(email, con_name, ver);
//    console.log('zz = ' + zz);
//    if (zz == 'New') {
      //  saveInDB(email, baandaID, con_name, con_type, ver, abi, txnhash, conaddr)
//    }
//    return false;
//}

// Called function by above 
// ============================================================================================
function saveContractInDB(email, baandaID, con_name, contype, ver, abi, txnhsh, conaddr) {
                  //      email, baandaID, conName, con_type, ver, abi, deployTxnHash, deployedContractAddres
    console.log('inside insertDB');
    console.log("email : " + email + "| baandaID : " + baandaID + "| con_name : " + con_name + "| con_type : " + contype + "| ver : " + ver);
    contype = "Copyright";
    console.log("email : " + email + "| baandaID : " + baandaID + "| con_name : " + con_name + "| con_type : " + contype + "| ver : " + ver);
    console.log("abi : " + abi);
    console.log("txnhsh : " + txnhsh + "| conaddr : " + conaddr);
    

    var ConD = new ContractDoc({
        baanda_id: baandaID,
        email: email,
        contract_name: con_name,
        contract_version: ver,
        contract_type: contype,
        abi: abi,
        contract_address: conaddr,
        txn_hash: txnhsh,
        create_time: Date.now()
    });

    db.on('connected', function(err){
        if (err) {
            console.log('mongodb for baandaDB no connected Error: ' + err);
        } else ("Database connection all right...");
    })

    console.log ("About to call conD.save ...");
    var xx = 0;
    var ret = true;
    ConD.save(function (err, res) {
        if (err) {
            console.log('DB Save Error: ' + err);
            //return false;
            ret = false;
        } else {
            console.log('Saved Contract in database.' + res);
            xx = 1;
        }
    });

    var loop = 1;
    while (xx < 1) {
        require('deasync').sleep(1000);
        console.log("Loop = " + loop + " xx = " + xx);
        loop++;
        if (loop > 25) {
            console.log("Looping to save in DB = " + loop + ' xx=' + xx );
            ret = false;
            xx = 1;
        }
    }

    return ret;
}


// Find is a contract exists for an email + contract name + version
function ifContractExists(email, con_name, version) {

    console.log("Inside ifemailexists ... " + email + " con_name=" + con_name + ' version=' + version);
    var xx = 0;
    var ret = '';

    var query = ContractDoc.findOne({ 'email': email, 'contract_name': con_name, 'contract_version': version });

    query.select();
    query.exec(function (err, result) {
        if (err) {
            console.log("ifemail .. Error:" + err);
            ret = "Error: " + err;
        }
        console.log('result = ' + result);
        if (result) {
            console.log("Exists");
            xx = 1;
            ret = "Exists";
        } else {
            xx = 1;
            console.log("New");
            ret = 'New'
        }
    });

    var loop = 1;
    while (xx < 1) {
        require('deasync').sleep(1000);
        console.log("Loop = " + loop + " xx = " + xx);
        loop++;
        if (loop > 25) {
            //console.log("Looping ifexists loop=" + loop + ' xx=' + xx + " >");
            ret = 'Timeout';
        }
    }

    return ret;

}

module.exports.saveContractInDB = saveContractInDB;
module.exports.ifContractExists = ifContractExists;