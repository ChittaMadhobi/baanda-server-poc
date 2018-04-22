'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IdentitySchame = new Schema(
    {
        baanda_id:  Number,    
        name : String, 
        email:  String, 
        pwd : String,
        phone: Number,
        create_time: Date
    }
);

var IdentityDoc = mongoose.model('IdentityDoc', IdentitySchame);
module.exports = IdentityDoc;