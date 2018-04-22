// --------------------------------------------------------------------------------------------
// Description : This does the following:
//    1. Read a solidity file and replace some key words and converts it into string
//    2. Using the output sol string, it now compiles to for abi and bytecode
//    3. It then connects to ropsten in infura (if special token is needed, change provider_url in global)   
//    4. Deployes the abi in Ropsten using private key and owner's ether address (no unlock needed)
//    5. Get contract address from txnHash
//
// Author : Baanda (everyone)
//---------------------------------------------------------------------------------------------
// Dependencies : Please install via npm
var fs = require('fs');
var solc = require('solc');
var Web3 = require('web3');
var deasync = require('deasync');
var Tx = require('ethereumjs-tx');

// define global variables
console.log('Started the process - Ropsten in Infura -----------------------------------------');
var contract_name = 'Token';
var templateFile = './Token.sol';
var targetFile = 'TK_' + contract_name + '.sol';
var toReplace = '/Token/g';
var targetConName = 'TK_' + contract_name;
var provider_url = "https://ropsten.infura.io";
var solcData = '';
var abi = '';
var bytecode = '';
var web3 = '';
var account = '0x2d670E1127802966C62DD0769AF50fD05ce6204e';
var private_key = '05bbc2accf7fe3d8090bd6503a6f49590406d57648ce5ce27f935bfa07a3bdf';
var key = '';
var txnHash = '';

console.log('template file=' + templateFile + ' | target file=' + targetFile + ' | toReplace=' + toReplace + ' |targetConName=' + targetConName);

// 1. read file and turn into string after customizing the 
if (!replaceStrInFile(templateFile, targetFile, toReplace, targetConName)) {
    console.log('Failed to read file write it into string ... exiting');
    return false;
} else {
    console.log("Successfully replaced str in file ... for solodity string");
    //console.log("Result = " + solcData);
}
// 2. call compile, feed the solidity.string and get abi, bytecode 
if (!compileSC(solcData, targetConName)) {
    console.log('Failed to compile ... exiting');
    return false;
} else {
    console.log("Successfully compiled the solidity and creates ABI & bytecode : " + abi);
}
// 3. connect to Web3
if (!doConnect(provider_url)) {
    console.log('Failed to connect to provider_url<' + provider_url + '> ... exiting');
    return false;
} else {
    console.log("Successfully connected and have valid web3");
}
// 4. deploy using ropsten infura & private key 
if (!deployContract()) {
    console.log('Failed to deploy in the provider URL ... exiting');
    return false;
} else {
    console.log("Successfully deployed with txnHash = " + txnHash);
}
// 5. Get contrct address from txnhash



//==================================================================================================
// Deploy contract in infura
//==================================================================================================
function deployContract() {

    try {
        web3.eth.accounts.wallet.add('0x' + private_key);
    } catch (err) {
        console.log("ERROR: web3.eth.accounts.wallet.add('0x' + private_key) ----: " + err);
        return false;
    }

    try {
        console.log("In try ... for creating contract object");
        // 1. Create contract object
        var contract = new web3.eth.Contract(abi);
        console.log("Created Contract Object:" + req.query.ether_Addr);
    } catch (err) {
        console.log("ERROR: Create contract object error: " + err);
        return false;
    }

    try {
        contract.deploy({
            data: '0x' + bytecode
        }).send({
            from: account,
            gas: 1500000,
            gasPrice: '800000000'
        }, function(error, transactionHash){

        }).on('error', function (error){
            console.log('Contract.deploy send error :' + error);
        }).on('transactionHash', function(transactionHash){
            console.log('Deployed transaction hash is: ' + transactionHash);
        }).on('receipt', function(receipt){
            console.log('Received Contract Address :' + receipt.contractAddress);
        }).on('confirmation', function (confirmationNumber, receipt){
            console.log('Confirmation : ' + confirmationNumber);
        })
    } catch (err) {
        console.log('Some error happened at the trying of contract.deploy ... Check code');
        return false;
    }

    return true;
}

/*
function deployContract() {
    key = new Buffer(private_key, 'hex');

    var Contract = web3.eth.contract(abi);
    //var gasPrice = web3.eth.gasPrice;
    //var gasPriceHex = web3.toHex(gasPrice);
    var gasPriceHex = web3.toHex(20000000000);
    var gasLimitHex = web3.toHex(3000000);

    var tra = {
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        data: '0x' + bytecode,
        from: account
    };

    var tx = new Tx(tra);
    tx.sign(key); // key is buffered private key in hex
    var stx = tx.serialize();
    eb3.eth.sendRawTransaction('0x' + stx.toString('hex'), (err, hash) => {
        if (err) {
            console.log('Deployment error : ' + err);
            return false;
        }
        console.log('contract creation tx: ' + hash);
        txnHash = hash;
        return true;
    });
}
*/
// ===============================================================================================
// Get contracr address 
function getContractAddress() {
    var xx = 0;
    web3.eth.getTransactionReceipt(txnHash, function (error, result) {
        console.log(result);
        if (error) {
            console.log('Failed to get contract - error = ' + error);
            return false;
        } else {
            xx = 1;
            console.log('Cntract Address = ' + result.contractAddress);                            
        }
    });

    console.log ("xx = " + xx);
    var loop = 0;
    while ( xx < 1) {
        require('deasync').sleep(10000); 
        console.log("Loop = " + loop + " xx = " + xx);
        loop++;
        if (loop > 25) {
            console.log ("Time out waiting for contract address for tcnHash <" + txnHash+ " >");
            return false;
        }
    }
}

// Utility functions - The following function is for Copyright ... will become complex system by
//                     itself for intelligence based NL to FL translation. 
// ==================================================================================================
function replaceStrInFile(templateFile, targetFile, toReplace, byReplace) {
    console.log('Start:: template File = ' + templateFile, ' | target File' + targetFile);
    //var result = 'none';

    //down vote
    //You have to catch the error and then check what type of error it is.
    var data = '';
    try {
        data = fs.readFileSync(templateFile, 'utf8');
        var result = data.replace(toReplace, byReplace);
        solcData = result;
        //console.log("1. solcData " + solcData + '  toReplace :' +toReplace + ' byReplace:' + byReplace);
        console.log('Success replace string: ' + data.substring(0, 20));
        fs.writeFile(targetFile, result, 'utf8', function (err) {
            if (err) {
                console.log("Write >>: " + err);
                return false;
            }
        });
    } catch (err) {
        // If the type is not what you want, then just throw the error again.
        if (err.code !== 'ENOENT') throw err;
        console.log('Templat File : <' + templateFile + '> does not exisit.');
        return false;
        // Handle a file-not-found error
    }
    return true;
}
// ================================================================================================
/* 
** Following function receives the solidity contract and contract name 
** to compile and store it in bytecode and abi
*/
function compileSC(solcData, ContractName) {
    console.log("solcData : " + solcData + " | Contract name = :" + ContractName);
    //const input = fs.readFileSync('./api/target/' + ContractName + '.sol');
    try {
        var input = solcData;
        output = solc.compile(input.toString(), 1);
        bytecode = output.contracts[":" + ContractName].bytecode;
        abi = JSON.parse(output.contracts[':' + ContractName].interface);
        // For debugging ... remove later on and insert into Mongo as log
        console.log('abi str:' + JSON.stringify(abi));
        return true;
    } catch (err) {
        console.log('Error compiling : ' + err);
        return false;
    }
}
// ======================================= connect
function doConnect(provider_url) {
    // provider_url
    //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    console.log('Provide URL : ' + provider_url);
    web3 = new Web3(new Web3.providers.HttpProvider(provider_url));
    if (web3 && web3.isConnected()) {
        console.log('Connected to Geth node : ');
        return true;
    } else {
        console.log('Failed to connect to the Geth node : ');
        return false;
    }
}
// =============================================================================================