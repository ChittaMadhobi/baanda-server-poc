/*
**  Written by Baanda ....
**  This module get the new cpyright fields and files and does the following
**
**  1> Make a SHA256 
**  2> IF SUCCESS then -- Loads the file in AWS and gets the URL
**  3> gets the baanda-id, contract-address and the ABI from the mongo for the email 
**  4> IF Success -- Insert contract name, URL, sha256, email into the smart contract of step #3
**  5> IF Success -- Insert the baanda-id, email, copyright-doc-name, summary, journal, file-AWS-S3-URL,   
**  6> Return message to user about the incident.
**  Question to ponder ... 'what happens if one fails - do we do something later on or should we plan to roll back?'
*/
var AWS = require('aws-sdk');
var mongoose = require('mongoose');
AWS.config.loadFromPath('./config.json');
s3 = new AWS.S3({ apiVersion: '2017-09-08' });
var fs = require('fs');
var Web3 = require('web3');

const ethUtil = require('../utils/etherUtilities.js');  // It is in the same directory

require('../models/contractStoredInEthModel.js');
var docEthCopyInDB = mongoose.model('contractInEth');
//Get the default connection
var db = mongoose.connection;

// Global Variables
var sha256result = '';
var s3urlresult = '';
var txn_hash = '';
var web3 = '';
const parityURL = "http://localhost:8545";
var chargeBaandaEthAddr = '0x008942a10cA7F936c302714D4c37294F74e2AC64';

var BaandaEthPwd = "Ranjan10";
var estimatedGas = 4700036;
var clientResponse = 'Successfully copyrighted the document. Proceed to next-step for Baanda Services';

function testMethodCall(req) {

    try {
        console.log("Trying testing method call ....");
        web3 = new Web3(new Web3.providers.HttpProvider(parityURL));
        console.log("1.web3 OK");
        console.log("++++++++++++++++++++++++++++++++++++++++++++");
        console.log("Address:" + req.body.ContractAddr + " ABI:" + req.body.ContractABI);
        var contract = web3.eth.contract(JSON.parse(req.body.ContractABI));
        console.log("1. MyContract OK");
        // initiate contract for an address
        var contractInstance = MyContract.at(req.body.ContractAddr);
        console.log("1. Instance OK");
        var result = contractInstance.getContractCount();
        // For other version of web3 1.+ beta use following for contract instance
        // var contractInstance = new web3.eth.Contract(req.body.ContractABI, req.body.ContractAddr);
        console.log("1. Result = " + result);
        result = contractInstance.getOwner();
        console.log("2. Result = " + result);
        ethUtil.unlockAccount(chargeBaandaEthAddr, BaandaEthPwd, web3);
        return "Test Success";
    } catch (err) {
        console.log("Error trying ...........check where it bummed");
        return "Test Failed ...";
    }
}

/*
function testing(req){
    try {
        console.log("Trying testing method call ....");
        web3 = new Web3(new Web3.providers.HttpProvider(parityURL));
        console.log("web3 OK");
        var MyContract = web3.eth.contract(JSON.parse(req.body.ContractABI));
        console.log("MyContract OK");
        console.log("MyContract address : " + req.body.ContractAddr + " ABI:" + req.body.ContractABI);
        // initiate contract for an address
        var myContractInstance = MyContract.at("0x200dedae745278c102949bd65c8cc0c53df9e8a2");
        console.log("Instance OK");
        result = myContractInstance.getContractCount();
        console.log("2. Result = " + result);
        return "Test Success";
    } catch (err) {
        console.log("Error trying ...........check where it bummed");
        return "Test Failed ...";
    }
}
*/


function copyrightMgmt(req) {
    // Get sha256 & S3 URL
    var ret = true;


    //web3 = ethUtil.getweb3Conn(web3);
    //if (!web3) {
    //    clientResponse = "Response: Failed to get web3 connection using url :" + parityURL;
    //    ret = false;
    //}

    if (ret) {
        ret = shaAndLoadInCloud(req);
    }
    // On success of crrating sha256 and inserting into AWS and in Mongo try addCopyright into Ethereum 
    //if (ret) {
    //    ret = ethUtil.unlockAccount(chargeBaandaEthAddr, BaandaEthPwd, web3);
    //}

    if (ret) {
        // Insert into Ethereum if Sha and url is available
        ret = insertInEthereum(req);
    }
    //ethUtil.lockAccount(chargeBaandaEthAddr, web3);

    //if (ret) {
    //    ret = insertInMongo(req);
    //}
    // Check later on if Ethereum succeeded but failed to insert into Mongo ... how to roll back.
    return clientResponse;  //return original success or specific error info as it happened.
}

/*
function getweb3Conn() {
    var ret1 = true;
    //web3 = '';
    try {
        web3 = new Web3(new Web3.providers.HttpProvider(parityURL));

        console.log("web3 link created successfully for parityURL=" + parityURL);
    } catch (e) {
        console.log("web3 creation error for parityURL=" + parityURL + "|| Error=" + e);
        clientResponse = "Response: Error 3a of 4: Failed to instantiate web3 - :" + e;
        ret1 = false;
    }

    //return web3;
    return ret1;
}
*/

function shaAndLoadInCloud(req) {
    var ret = true;

    var SHA256 = require("crypto-js/sha256");
    try {
        sha256result = SHA256(JSON.stringify(req.files.cpfile.data)); // just testing the difference
        console.log("Deducted SHA256 from _doc.file_body : " + sha256result);
        if (!insertUploadedFileInS3(req)) {
            console.log("Error : Failed to insertUploadedFileInS3(req)");
            clientResponse = "Response: Step 2 of 4: Failed to insert into the AWS.S3.";
            ret = false;
        }

    } catch (e) {
        console.log("Deducted SHA256 had error : " + e);
        clientResponse = "Response: Step 1 of 4: Failed to sha256 the file.";
        ret = false;
    }
    return ret;
}

function insertUploadedFileInS3(req) {
    console.log("Inside insertUploadedFileInS3 name = " + req.files.cpfile.name); // + " body=" + body);
    var ret = true;
    var xx = 0;
    var uploadParams = { Bucket: 'baanda', Key: req.files.cpfile.name, Body: req.files.cpfile.data };
    // call S3 to retrieve upload file to specified bucket
    s3.upload(uploadParams, function (err, data) {
        if (err) {
            console.log("Error S3 upload: " + err);
            ret = false;
            xx = 1;
        } if (data) {
            console.log("Upload Success - location:", data.Location);
            console.log("Data : " + data);
            xx = 1;
            s3urlresult = data.Location;
            //return (data);
        }
    });

    var loop = 1;
    while (xx < 1) {
        require('deasync').sleep(1000);
        //console.log("Loop = " + loop + " xx = " + xx);
        loop++;
        if (loop > 25) {
            console.log("Error: Loop - waiting  for inserting in S3 timedout ...");
            clientResponse = "Response: waiting  for inserting in S3 timedout ...: Timeout";
            ret = false;
        }
    }
    return ret;
}

// Insert, or add, a new copyright info (docname, SHA, URL, dates etc. into the Copyright contract)
function insertInEthereum(req) {
    //var web3 = '';
    var ret = true;
    var contractInstance = '';
    var contract = '';
    // Create the transaction object
    var txnObject = {
        from: chargeBaandaEthAddr,
        gas: estimatedGas
    }

    // parms are docname(dc), doctype(dt), docurl(du), docsha(ds), createTD(dct), updatedTS(dut) (create and update would be same here)
    // The sequence is important as below ... for it is mapped to funtion parms in solidity
    var dc = req.body.docname;
    var dt = 'copyright';
    var du = s3urlresult;  // This has already been defined in order to get here
    var ds = sha256result; // This has already been defined in order to get here
    var dct = Math.floor(new Date() / 1000);
    var dut = Math.floor(new Date() / 1000);
    console.log("dc=" + dc + " | dt=" + dt + " | du=" + du + " | ds=" + ds + " | dct=" + dct + " | dut=" + dut);
    // 
    var xx = 0;
    // Execute addCopyright
    if (ret) {
        var params = {
            from: '0x008942a10cA7F936c302714D4c37294F74e2AC64',
            gas: 500000
        }
        try {
            console.log("Trying insertInEthereum method call from insert in Ethereum....");
            web3 = new Web3(new Web3.providers.HttpProvider(parityURL));
            console.log("web3 connection OK");
            //contract = web3.eth.contract(JSON.parse(req.body.ContractABI));
            //console.log("contract creation OK");
            // initiate contract for an address
            //contractInstance = contract.at(req.body.ContractAddr);
            //console.log("Contract Instance OK");

            // For other version of web3 1.+ beta use following for contract instance
             var contractInstance = new web3.eth.Contract(JSON.parse(req.body.ContractABI), req.body.ContractAddr);
             console.log("Contract Instance OK");
            //var result = contractInstance.getContractCount();
            //console.log("1. Result count = " + result);
            //result = contractInstance.getOwner();
            //console.log("2. Result owner = " + result);
            console.log("Try unlocking address using web3 1 beta");
            if (ethUtil.unlockAccount(chargeBaandaEthAddr, BaandaEthPwd, web3)) {
                console.log("Unlocked Account");

                contractInstance.methods.addContract(dc, dt, du, ds, dct, dut).send(txnObject).on('receipt', function (receipt) {
                    console.log("@addContract.send():" + JSON.stringify(receipt));
                //savve to mongo or do whatever here
                });

                //contractInstance.addContract(dc, dt, du, ds, dct, dut, params, web3.eth.defaultBlock);
                //contractInstance.addContract(dc, dt, du, ds, dct, dut, params = {
                //    from: '0x008942a10cA7F936c302714D4c37294F74e2AC64',
                //    gas: 500000
                //});
                
                //contractInstance.addContract(dc, dt, du, ds, dct, dut, {
                //    from: '0x008942a10cA7F936c302714D4c37294F74e2AC64',
                //    gas: 500000
                //}, function(err, res) {
                //    console.log("XXXXXX");
                //});

                //contractInstance.addContract(dc, dt, du, ds, dct, dut, params, web3.eth.defaultBlock, function(err, result){
                //    console.log("CCCCC");
                //});

                console.log("Crossed ...addContract");

            } else {
                console.log("Could not unlock ...");
            }
            console.log("Crossed this ...");
            clientResponse = "Test Success - really";
        } catch (e) {
            console.log("Failed to execute contractInstance.addContract.sendTransaction | Error=" + e);
            clientResponse = "Response: Error 3d of 4: Failed to execute addContract - error=" + e;
            ret = false;
        }
    }

    return ret; // or false
}

function insertInMongo(req, status) {
    var ret = true;
    var xx = 0;
    var conAddr = req.body.ContractAddr;
    var docname = req.body.docname;
    var summary = req.body.summary;
    var journal = req.body.journal;
    var doctype = "Copyright";
    //sha256result 
    //s3urlresult 
    var filename = req.files.cpfile.name;
    var createdTS = Math.floor(new Date() / 1000); //eliminating miliseconds
    var status = "OK";
    console.log("conAddr=" + conAddr + " docname=" + docname + " summary=" + summary, " journal=" + journal,
        " doctype=" + doctype + " sha256reqult=" + sha256result + " s3urlresult=" + s3urlresult +
        " filename=" + filename + " createdTS=" + createdTS + " status=" + status + " txn_hash=" + txn_hash);
    if (doesDocnameExistForTheContract(conAddr, docname)) {
        var newCopyright = new docEthCopyInDB(
            {
                contract_address: conAddr,
                document_name: docname,
                contract_type: doctype,
                doc_hash: sha256result,
                txn_hash: txn_hash,
                summary: summary,
                journal: journal,
                file_name: filename,
                file_s3_url: s3urlresult,
                create_time: createdTS,
                Status: status
            }
        )
        newCopyright.save(function (error) {
            if (error) {
                console.log("Error: Trying to save new document in the mongodb ...:" + error);
                clientResponse = "Error while inserting into Mongo. Error:" + error;
                retmsg = false;
                xx = 1;
            } else {
                console.log("Success: Saved your registration in the database.");
                xx = 1;
            }
        });

        var loop = 1;
        while (xx < 1) {
            require('deasync').sleep(100);
            //console.log("Loop = " + loop + " xx = " + xx);
            loop++;
            if (loop > 25) {
                //console.log("Looping ifexists loop=" + loop + ' xx=' + xx + " >");
                ret = false;
            }
        }
    } else {
        ret = false;
        console.log("Check error log for doesDocnameExistForTheContract");
    }

    return ret;
}

function doesDocnameExistForTheContract(conAddr, docname) {
    console.log("Inside doesDocnameExistForTheContract(conAddr:" + conAddr + " docname:" + docname) + ")";
    var ret = true;
    var xx = 0;
    var query = docEthCopyInDB.findOne({ 'contract_addres': conAddr, 'document_name': docname });
    query.select();
    query.exec(function (err, result) {
        if (err) {
            console.log("doesDocnameExistForTheContract .. failed to exec Error:" + err);
            clientResponse = "Response: Error 4a of 4: doesDocnameExistForTheContract failed to exec :" + err;
            ret = false;
            xx = 1;
        }
        if (result) {
            console.log("doesDocnameExistForTheContract = yes ");
            clientResponse = "Response: Error 4b of 4: The docname for this contract already exist. Change the doc name or add version.";
            ret = False;
            xx = 1;
        } else {
            console.log("doesDocnameExistForTheCont ... it is New");
            xx = 1
        }
    });

    var loop = 1;
    while (xx < 1) {
        require('deasync').sleep(1000);
        //console.log("Loop = " + loop + " xx = " + xx);
        loop++;
        if (loop > 25) {
            ret = 'false';
            clientResponse = "Response: Error 4c of 4: doesDocnameExistForTheContract - error= Timeout";
        }
    }

    return ret;
}

module.exports.copyrightMgmt = copyrightMgmt;
module.exports.testMethodCall = testMethodCall;
//module.exports.testing = testing;


// Placeholder code
 //contractInstance.addContract.call(dc, dt, du, ds, dct, dut, txnObject,function (err, result) {
            //    if (err) {
            //        console.log("contractInstance.addContract error : " + err);
            //    } else {
            //        console.log("contractInstance.addContract success :" + result);
            //    }
            //});

            //alternate model with events
            //contractInstance.methods.addContract(dc, dt, du, ds, dct, dut).send(txnObject).on('receipt', function (error, receipt) {
            //    if (error) {
            //        console.log("@addContract.send() Error:" + error);
            //    } else {
            //        console.log("@addContract.send():" + JSON.stringify(receipt));
            //    }
            //    //savve to mongo or do whatever here
            //});

            //contractInstance.getContractCount.call({}, web3.eth.defaultBlock, function(error, result){
            //    console.log("Error : " + error, " Result:" + result);
            //});
            //contractInstance.addContract.sendTransaction(dc, dt, du, ds, dct, dut, txnObject);
            //savve to mongo or do whatever here

            /*  
                          //contractInstance.addContract.sendTransaction(dc, dt, du, ds, dct, dut, txnObject, function (err, result) {
                              contractInstance.methods.addContract(dc, dt, du, ds, dct, dut).send(txnObject), (function(err, result) {
                              console.log("received " + err + "::" + result);
                              if (err) {
                                  ret = false; 
                                  console.log("Failed contractInstance.addContract.sendTransaction | Error=" + err);
                                  clientResponse = "Response: Step 3e of 4: Failed to addContract - error=" + err;
                                  xx = 1;
                              } else {
                                  console.log("Successfully added the new contract via addContract ... Result=" + result);
                                  if (result.transactionHash) {
                                      txn_hash = result.transactionHash;
                                      xx = 1;
                                  }
                              }
                          });
              */
            /*
                        var loop = 1;
                        while (xx < 1) {
                            require('deasync').sleep(5000);
                            console.log("Loop = " + loop + " xx = " + xx);
                            loop++;
                            if (loop > 25) {
                                console.log("Error: Loop - waiting  for inserting in S3 timedout ...");
                                clientResponse = "Response: waiting  for inserting in Ethereum timedout ...: Timeout";
                                xx = 1;
                                ret = false;
                            }
                        }
            */