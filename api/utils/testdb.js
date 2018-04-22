
var deasync = require('deasync');
var mongoose = require('mongoose');
var mongourl = "mongodb://localhost/testDB";
//mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
mongoose.connect(mongourl, { useMongoClient: true });



var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() { console.log('connected')});

var xx = 0;
db.on('connected', function() {
    console.log('xxxxxxxxxxxxxxxxx');
    xx=1;
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


mongoose.Promise = global.Promise;

console.log("1.state=" + mongoose.connection.readyState);

var Dog = mongoose.model('Dog', { name: String });

var kitty = new Dog({ name: 'Are you kiddig' });
kitty.save(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('meow');
  }
});

console.log("2.state=" + mongoose.connection.readyState);