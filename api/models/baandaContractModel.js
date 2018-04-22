/*
//  The following is one-to-many pattern for saving smart contract related artifacts
//  needed for the DApp. 
*/
/*
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var baandaContractSchame = new Schema (
    {
        baanda_id: { type: Number, required: true},
        email: {type: String, required: true},
        contracts : [
            {
                con_name: {type: String, required: true},
                con_version: {type: Number, required: true},
                con_type: {type: String, required: true},
                abi: {type: String, required: true},
                con_address: {type: String, required: true},
                txn_hash: {type: String, required: true},
                create_time: {type: Date, default: Date.now}
            }
        ]
    }
);

var ContractDoc = mongoose.model('ContractDoc', baandaContractSchame);
module.exports = ContractDB;
*/