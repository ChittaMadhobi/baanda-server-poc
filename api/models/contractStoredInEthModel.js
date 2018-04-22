'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contractInEther = new Schema(
    {
        contract_address: String,        
        document_name: String,
        contract_type: String,
        doc_hash: String,
        txn_hash: String,
        summary: String,
        journal: String,
        file_name: String,
        file_s3_url: String,
        create_time: Date,
        Status: String
    }
);

var contractInEth = mongoose.model('contractInEth', contractInEther);
module.exports = contractInEth;