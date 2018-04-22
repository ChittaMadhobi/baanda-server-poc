/*
   Author: Sarbojit Mukherjee
   Org:    Baanda.com / P2PBazzar.com

   Description: >> It receives generated solidity code and other necessary data like
                >> Geth URL, Ether address for gas, the gas amount etc.
                >> It generates bytecode, ABI, then deploy the bytecode to Geth node.
                >> Return the Etherscan with txnHAsh and contract address for the generation
                   of DApp in the next module. 
                   
    Varsion : 0.0
    Date    : Now               

*/
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
var deasync = require('deasync');
const util = require('../utils/utility.js');
const db = require('../utils/contractDB.js');

var web3 = '';
var abi = '';
var bytecode = '';
var output = '';

var deployedContractAddress = null;
var deployTxnHash = null;


// 'req' has all the necessary request data from the front end that includes geth node URL, ether address for gas etc.
//  solData is the generated solidity data. ConName is the contact name provided by the end-user.
function compNdeploy(req, solcData, conName) {
    //console.log('function works ... it seems = ' + req.query.contract_name);
    console.log('req = ' + JSON.stringify(req.query));
    // Compile the individualized solidity code
    if (!compileSC(solcData, conName)) {
        Console.log("Error: Solidity code generation sucks ... return to the drawing board...");
        return ('Error in compiling - please check the AI engine output.');
    }

    console.log('Provide URL before connect call : ' + req.query.provider_url);
    if (doConnect(req.query.provider_url)) {
        //return 'Success: Connected to Geth node : ' + req.query.provider_url;
        console.log('Eth addr : ' + req.query.ether_Addr + ' | pwd : ' + req.query.aether_password);
        var dbMsg = '';
        //var msg = unlockAccountSync(req.query.ether_Addr, 'Ranjan10');
        var msg = unlockAccount(req.query.ether_Addr, req.query.aether_password);
        //console.log('unlock msg = reached here | ' + msg); // + msg.substring(0, 5).toLowerCase()); 

        // ---> Create contract & deploy
        if (deployContract(req)) {
            if (!deployedContractAddress) {
                if (deployTxnHash) {
                    console.log("Trying to get contract address via getContractAddress ... ");
                    deployedContractAddress = getContractAddress();
                    console.log("Got contract adress via asking for it : " + deployedContractAddress);
                }
            }
            if (deployedContractAddress) {
                console.log("deployCnotract seems to be successful ...");
                console.log("Endeavoring to store in database ...");
                var email = req.query.emailAddress;
                var baandaID = 1;
                var contypex = "Copyright";
                var ver = 1;
                if (db.saveContractInDB(email, baandaID, conName, contypex, ver, abi, deployTxnHash, deployedContractAddress)) {
                    dbMsg = 'Succeccfully saved in DB.';
                } else {
                    dbMsg = 'Failed to store it in DB. Find a way to sync this to DB from log file.';
                }
            } else {
                console.log("Could not get contract message via asking with TxnHash : " + deployTxnHash);
                dbMsg = "Did not try storing in DB because did not get to contract address."
            }
        } else {
            console.log("deployCnotract seems to be UNsuccessful ...");
            msg = 'Failed to deploy contract - did not get deployTxnHash. Check log for details.'
            return msg;
        }


        var msg = "Success: TxnHash = " + deployTxnHash + " Address = " + deployedContractAddress + "| DB Msg = " + dbMsg;
        console.log("Returning : " + msg);
        return msg;
    } else {
        return 'Error: Failed to connect to the geth node: ' + req.query.provider_url;
    }
}


/*
** Using abi, bytecode, deployContract creates:
   1. new contract with abi
   2. Using input informations ... develops contract information  
*/

function deployContract(req) {
    console.log("Got into deployContract");

    // Try to deploy only if there is valid abi and bytecode
    if (abi && bytecode) {
        var timeOutCounter = 0;
        var ret = true;

        console.log("----------------- XXX ----------------");
        // 1. create contract object
        try {
            console.log("In try ... for creating contract object");
            // 1. Create contract object
            var contract = web3.eth.contract(abi);
            console.log("Created Contract Object:" + req.query.ether_Addr);
        } catch (err) {
            console.log("Create contract object error: " + err);
            return false;
        }
        // 2. Estimated gas value should  come from configuration or frontend. Hard coded it for POC
        var gasNeeded = 4700036;
        console.log("Gas from UI is : " + req.query.gas_fee);
        // 3. Create params for deployment
        var params = {
            from: req.query.ether_Addr,
            gas: gasNeeded,
            data: '0x' + bytecode
        }
        // 4. Setup constructor parameter (if any)
        // var constructor_param = some_value (say 10) // we don't have any for our case
        // It is a place holder if needed in future versions
        // Do it via >> params = 'constructor_param-1,' + 'constructor_param-2' + ... + params;

        // 5. This is where contract gets deployed
        // Callback method gets called twice (*2*)
        // First time: Result = Txn Hash
        // Second time: Result = contract Address -- May have to call it separately
        // ------------------------------ var ssync = true;
        // ------------------------------ while (ssync) {
        // checking to see if we get around the     
        console.log("req.query.emailAddress = " + req.query.emailAddress);
        var xx = 0;
        contract.new(req.query.emailAddress, params, function (error, result) {
            if (error) {
                console.log('Deployment Failed : ' + error);
                //return false; This seems to be a Ethereum bug
                //ret = true;
            } else {
                console.log('Deployment OK - Result : ' + result);
                if (result.address) {
                    console.log("Contract Address : " + result.address);
                    deployedContractAddress = result.address;
                    xx = 2;
                } else {
                    deployTxnHash = result.transactionHash;
                    xx = 1;
                    console.log("Transaction Hash : " + result.transactionHash);
                }
            }
        });
        // Checking if this bypass callback hell
        // ------------------------------}

        console.log("xx = " + xx);
        var loop = 0;
        while (xx < 2) {
            require('deasync').sleep(1000);
            console.log("Loop = " + loop + " xx = " + xx);
            loop++;
            if (loop > 20) {
                if (xx < 1) {
                    console.log("Time out waiting for contract address (if xx = 1) no txnHsh yet ... Very bad :( ... < xx = " + xx + " >");
                    return false;
                } else {
                    console.log("Time out in first wait for address ...");
                    xx = 2;
                }
            }
        }


        console.log("Completed deployment with TxnHahs = " + deployTxnHash + ' & contract address = ' + deployedContractAddress);
        return ret;

    } else {
        console.log("Invalid ABI or bytecode -- compile properly abi = " + abi);
        return false;
    }
}


// Manju original
function unlockAccount(account, password) {
    console.log("In unlockAccounrt #:" + account + " | " + password);
    var sync = true;
    var xx = 0;
    web3.personal.unlockAccount(account, password, function (error, result) {
        //console.log ("error is:" + error);
        //console.log("result is:" + result);
        if (!error) {
            data = result + "-- Successful in unlocking";
            console.log("Unlocked account = " + account);
            sync = false;
        } else {
            data = result + " -- failed in unlocking <check it is local geth, eth addr & pwd combo --";
            sync = false;
        }
    });

    while (sync) {
        require('deasync').sleep(1000);
        console.log("Wait for unlocking xx=" + xx);
        xx++;
        if (xx > 20) sync = false;
    }
    return data;
}


/* 
** Following function receives the solidity contract and contract name 
** to compile and store it in bytecode and abi
*/
function compileSC(solcData, ContractName) {
    console.log("solcData : " + solcData + " | Contract name : == " + ContractName);
    //const input = fs.readFileSync('./api/target/' + ContractName + '.sol');
    try {
        var input = solcData;
        output = solc.compile(input.toString(), 1);
        bytecode = output.contracts[':' + ContractName].bytecode;
        abi = JSON.parse(output.contracts[':' + ContractName].interface);
        // For debugging ... remove later on and insert into Mongo as log
        console.log('abi str:' + JSON.stringify(abi));
        return true;
    } catch (err) {
        console.log('Error compiling : ' + err);
        return false;
    }
}

function doConnect(provider_url) {
    // provider_url
    //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    console.log('Provide URL : ' + provider_url);
    web3 = new Web3(new Web3.providers.HttpProvider(provider_url));
    if (web3 && web3.isConnected()) {
    //if (web3) {
        console.log('Connected to Geth node : ');
        return true;
    } else {
        console.log('Failed to connect to the Geth node : ');
        return false;
    }
}


function lockAccount(account) {
    console.log("In unlockAccounrt #:" + account + " | " + password);
    var sync = true;

    web3.personal.lockAccount(account, function (error, result) {

        console.log(error, result)
        if (error) {
            console.log('Failed to lock - Error: ' + error);
        } else {
            console.log("Locked account : " + account);
        }
    });
}

// Get Contract address from txnHash
function getContractAddress() {

    var txnhash = deployTxnHash;
    var sync = true;
    var data = null;
    var xx = 0;
    console.log("1. Inside getContractAddress ...");
    if (txnhash) {
        web3.eth.getTransactionReceipt(txnhash, function (error, result) {
            console.log(result);
            if (error) {
                console.log('Message: It has not been mined yet for transaction.' + txnhash);
                sync = false;
            } else {
                data = result.contractAddress;
                console.log('Contract Address is: ' + data);
                sync = false;
            }
        });
    } else {
        console.log('txnhash is null : ' + txnhash);
    }

    while (sync) {
        require('deasync').sleep(4000);
        console.log("Wait for contract address xx=" + xx);
        xx++;
        if (xx > 20) sync = false;
    }
    return data;
}


//module.exports.compileSC = compileSC;
module.exports.compNdeploy = compNdeploy;
