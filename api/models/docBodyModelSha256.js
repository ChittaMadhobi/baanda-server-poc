'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var docBodyModelSha256 = new Schema(
    {
        file_body: Buffer  
    }
);

var DocSha256 = mongoose.model('DocSha256', docBodyModelSha256);
module.exports = DocSha256;