var fs = require('fs');
//var wait = require('wait.for');
//var promise = require('promise');

// This function replace a string 'toReplace' by a string 'byReplace' 
function replaceStrInFile(templateFile, targetFile, toReplace, byReplace) {
    console.log('Start:: template File = ' + templateFile, ' | target File' + targetFile);
    var result = 'none';

    //down vote
    //You have to catch the error and then check what type of error it is.
    var data = '';
    try {
        data = fs.readFileSync(templateFile, 'utf8');
        var result = data.replace(toReplace, byReplace);
        console.log('Success replace string: ' + data.substring(0, 20));
        fs.writeFile(targetFile, result, 'utf8', function (err) {
            if (err) {
                console.log("Write >>: " + err);
                return result + 'write file';
            }
        });
    } catch (err) {
        // If the type is not what you want, then just throw the error again.
        if (err.code !== 'ENOENT') throw err;
        console.log('Templat File : <' + templateFile + '> does not exisit.')
        // Handle a file-not-found error
    }
    
    return result;

}

// In case of sleeping 
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
    console.log('Taking a break...' + new Date());
    await sleep(2000);
    console.log('Two second later' + new Date());
}


module.exports.replaceStrInFile = replaceStrInFile;