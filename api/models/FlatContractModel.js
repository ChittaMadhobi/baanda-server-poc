'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var baandaContractSchema = new Schema(
    {
        baanda_id:  Number,     
        email:  String, 
        contract_name: String,
        contract_version: Number,
        contract_type: String,
        abi: Object,
        contract_address: String,
        txn_hash: String,
        create_time: Date
    }
);

var ContractDoc = mongoose.model('ContractDoc', baandaContractSchema);
module.exports = ContractDoc;