/*
** Author: Baanda
** 
** There are some basic operations used by various Ethereum related functions
** These will be covered in this module.
**       1. Unlock account
**       2. Lock account
*/

const Web3 = require('web3');
const parityURL = "http://localhost:8545";
var Web3EthPersonal = require('web3-eth-personal');
var personal = new Web3EthPersonal("http://localhost:8545");

function unlockAccount(account, password, web3) {
    console.log("In unlockAccount #:" + account + " | " + password);
    var sync = true;
    var ret = true;
    var xx = 0;
    // self.web3.eth.personal.unlockAccount(account.address, account.privateKey, 200)
    /*
    web3.personal.unlockAccount(account, password, function (error, result) {
    //web3.eth.personal.unlockAccount(account, password, function (error, result) {
        if (!error) {
            console.log("Unlocked account = " + account + " Result:" + result);
            sync = false;
            ret = true;
        } else {
            console.log("Failed to unlock account (check addr or password) - Error: " + error);
            sync = false;
        }
    });
    */
    web3.eth.personal.unlockAccount(account, password)
	.then((response) => {
        console.log(response);
	}).catch((error) => {
        console.log(error);
        ret = false;
	});

    /*
    while (sync) {
        require('deasync').sleep(1000);
        console.log("Wait for unlocking xx=" + xx);
        xx++;
        if (xx > 20) {
            sync = false;
            ret = false;
        }
    }
    */
    return ret;
}


function lockAccount(account, web3) {

    console.log("Inside doLockAccount ....");
    var ret = true;
    //web3.eth.personal.lockAccount(account);
    //, function (error, result) {
    //console.log(error, result)
    //  if (error) {
    //      console.log("Error while locking the account : " + error);
    //      ret = false;
    //  }
    //});
    return ret;
}



function getweb3Conn(web3) {
    //var web3 = '';
    try {
        web3 = new Web3(new Web3.providers.HttpProvider(parityURL));
        //if (web3 && web3.isConnected()) {
        if (web3) {
            console.log("web3 link created successfully for parityURL=" + parityURL);
        } else {
            console.log("web3 creation error for parityURL=" + parityURL + "|| Error=" + e);
            web3 = '';
        }
    } catch (e) {
        console.log("Execution error Web3(new Web3.providers.HttpProvider(parityURL))=" + parityURL + "|| Error=" + e);
        web3 = '';
        //clientResponse = "Response: Error 3a of 4: Failed to instantiate web3 - :" + e;
    }

    return web3;
}


module.exports.getweb3Conn = getweb3Conn;
module.exports.unlockAccount = unlockAccount;
module.exports.lockAccount = lockAccount;